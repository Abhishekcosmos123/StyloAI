const { google } = require('googleapis');
const User = require('../models/User');

/**
 * Get OAuth2 client for Google Calendar
 */
const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    const missing = [];
    if (!clientId) missing.push('GOOGLE_CALENDAR_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_CALENDAR_CLIENT_SECRET');
    if (!redirectUri) missing.push('GOOGLE_CALENDAR_REDIRECT_URI');
    
    throw new Error(
      `Google Calendar OAuth credentials not configured. Missing: ${missing.join(', ')}. ` +
      `Please add these to your backend/.env file and restart the server.`
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Generate Google Calendar OAuth URL
 */
const getAuthUrl = (userId) => {
  try {
    const oauth2Client = getOAuth2Client();
    
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId.toString(), // Pass user ID in state
      prompt: 'consent', // Force consent to get refresh token
    });

    // Ensure URL is properly formatted
    if (!authUrl || typeof authUrl !== 'string') {
      throw new Error('Failed to generate auth URL');
    }

    console.log('Generated auth URL for user:', userId);
    return authUrl;
  } catch (error) {
    throw error;
  }
};

/**
 * Exchange authorization code for tokens
 */
const exchangeCodeForTokens = async (code) => {
  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    throw new Error(`Failed to exchange code for tokens: ${error.message}`);
  }
};

/**
 * Save calendar tokens to user
 */
const saveCalendarTokens = async (userId, tokens) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.googleCalendar = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      isConnected: true,
    };

    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Get authenticated calendar client for user
 */
const getCalendarClient = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.googleCalendar?.isConnected) {
      throw new Error('Google Calendar not connected');
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken,
      expiry_date: user.googleCalendar.tokenExpiry?.getTime(),
    });

    // Refresh token if expired
    if (user.googleCalendar.tokenExpiry && new Date() >= user.googleCalendar.tokenExpiry) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      user.googleCalendar.accessToken = credentials.access_token;
      if (credentials.refresh_token) {
        user.googleCalendar.refreshToken = credentials.refresh_token;
      }
      user.googleCalendar.tokenExpiry = credentials.expiry_date 
        ? new Date(credentials.expiry_date) 
        : null;
      await user.save();

      oauth2Client.setCredentials(credentials);
    }

    return google.calendar({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    throw error;
  }
};

/**
 * Get calendar events for a date range
 */
const getCalendarEvents = async (userId, startDate, endDate) => {
  try {
    const calendar = await getCalendarClient(userId);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = response.data.items || [];
    
    // Parse events for outfit planning
    const parsedEvents = events.map(event => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      type: categorizeEvent(event.summary, event.description),
    }));

    return parsedEvents;
  } catch (error) {
    throw new Error(`Failed to fetch calendar events: ${error.message}`);
  }
};

/**
 * Categorize event for outfit planning
 */
const categorizeEvent = (title, description) => {
  if (!title) return 'other';
  
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  // Office/Work events
  if (combined.match(/\b(meeting|office|work|conference|presentation|interview|client|business)\b/)) {
    return 'office';
  }

  // Party/Social events
  if (combined.match(/\b(party|celebration|birthday|anniversary|wedding|reception|dinner|night out)\b/)) {
    return 'party';
  }

  // Travel events
  if (combined.match(/\b(travel|trip|vacation|flight|hotel|journey|tour)\b/)) {
    return 'travel';
  }

  // Fitness events
  if (combined.match(/\b(gym|workout|exercise|fitness|yoga|running|sports)\b/)) {
    return 'fitness';
  }

  // Casual/Daily
  if (combined.match(/\b(lunch|coffee|casual|hangout|friends)\b/)) {
    return 'casual';
  }

  return 'other';
};

/**
 * Get today's events
 */
const getTodaysEvents = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await getCalendarEvents(userId, today, tomorrow);
  } catch (error) {
    throw error;
  }
};

/**
 * Get week's events
 */
const getWeekEvents = async (userId, weekStartDate) => {
  try {
    const startDate = new Date(weekStartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    return await getCalendarEvents(userId, startDate, endDate);
  } catch (error) {
    throw error;
  }
};

/**
 * Disconnect Google Calendar
 */
const disconnectCalendar = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.googleCalendar = {
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      isConnected: false,
    };

    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if calendar is connected
 */
const isCalendarConnected = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user?.googleCalendar?.isConnected || false;
  } catch (error) {
    return false;
  }
};

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  saveCalendarTokens,
  getCalendarEvents,
  getTodaysEvents,
  getWeekEvents,
  disconnectCalendar,
  isCalendarConnected,
  categorizeEvent,
};

