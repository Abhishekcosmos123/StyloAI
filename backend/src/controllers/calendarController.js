const {
  getAuthUrl,
  exchangeCodeForTokens,
  saveCalendarTokens,
  getTodaysEvents,
  getWeekEvents,
  disconnectCalendar,
  isCalendarConnected,
} = require('../services/calendarService');
const { requirePremium } = require('../middlewares/premium');

/**
 * Get Google Calendar OAuth URL
 */
const getAuthUrlController = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Validate Google Calendar is configured
    if (!process.env.GOOGLE_CALENDAR_CLIENT_ID || !process.env.GOOGLE_CALENDAR_CLIENT_SECRET) {
      console.error('Google Calendar not configured. Missing:', {
        hasClientId: !!process.env.GOOGLE_CALENDAR_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        hasRedirectUri: !!process.env.GOOGLE_CALENDAR_REDIRECT_URI,
      });
      return res.status(500).json({
        success: false,
        message: 'Google Calendar API is not configured. Please add GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, and GOOGLE_CALENDAR_REDIRECT_URI to your .env file and restart the server.',
        details: {
          missing: {
            clientId: !process.env.GOOGLE_CALENDAR_CLIENT_ID,
            clientSecret: !process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
            redirectUri: !process.env.GOOGLE_CALENDAR_REDIRECT_URI,
          },
        },
      });
    }

    if (!process.env.GOOGLE_CALENDAR_REDIRECT_URI) {
      return res.status(500).json({
        success: false,
        message: 'GOOGLE_CALENDAR_REDIRECT_URI is not configured. Please add it to your .env file.',
      });
    }

    const authUrl = getAuthUrl(userId);
    
    if (!authUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate authorization URL',
      });
    }

    console.log('Auth URL generated successfully for user:', userId);

    res.json({
      success: true,
      data: {
        authUrl,
      },
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate authorization URL',
    });
  }
};

/**
 * Handle OAuth callback
 */
const handleCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    console.log('Callback received:', { 
      hasCode: !!code, 
      hasState: !!state, 
      hasError: !!error,
      state: state 
    });
    
    // Check if user denied access
    if (error) {
      console.log('User denied access:', error);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Connection</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 400px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Connection Cancelled</h1>
            <p>You cancelled the Google Calendar authorization. You can try again from the app.</p>
            <p style="font-size: 14px; color: #999;">You can close this page and return to the StyloAI app.</p>
          </div>
        </body>
        </html>
      `);
    }

    const userId = state;

    if (!code) {
      console.error('No authorization code in callback');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Connection</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 400px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1>Authorization Error</h1>
            <p>No authorization code received. Please try again from the app.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (!userId) {
      console.error('No user ID in state parameter');
      // Return page with code for manual entry
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Connection</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 400px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            .code-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              font-family: monospace;
              word-break: break-all;
              font-size: 12px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            button {
              background: #667eea;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📋</div>
            <h1>Authorization Code</h1>
            <p>Copy this code and enter it in the StyloAI app:</p>
            <div class="code-box" id="code">${code}</div>
            <button onclick="navigator.clipboard.writeText('${code}').then(() => alert('Copied!'))">Copy Code</button>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Go to Calendar Settings → Enter Authorization Code
            </p>
          </div>
        </body>
        </html>
      `);
    }

    console.log('Processing OAuth callback for user:', userId);

    // Exchange code for tokens
    let tokens;
    try {
      tokens = await exchangeCodeForTokens(code);
      console.log('Tokens exchanged successfully');
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      // Return page with code for manual entry
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Connection</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 400px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .code-box {
              background: #fff3cd;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              font-family: monospace;
              word-break: break-all;
              font-size: 12px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            button {
              background: #667eea;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
            <h1>Connection Issue</h1>
            <p>Please copy this code and enter it manually in the app:</p>
            <div class="code-box" id="code">${code}</div>
            <button onclick="navigator.clipboard.writeText('${code}').then(() => alert('Copied!'))">Copy Code</button>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Error: ${tokenError.message}
            </p>
          </div>
        </body>
        </html>
      `);
    }

    // Save tokens to user
    try {
      await saveCalendarTokens(userId, tokens);
      console.log('Calendar connected successfully for user:', userId);
    } catch (saveError) {
      console.error('Error saving tokens:', saveError);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Connection</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 400px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            .error-details {
              background: #fee;
              border: 1px solid #fcc;
              border-radius: 8px;
              padding: 12px;
              margin-top: 20px;
              font-size: 12px;
              color: #c33;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Connection Failed</h1>
            <p>There was an error saving your calendar connection.</p>
            <div class="error-details">
              ${saveError.message || 'Unknown error'}
            </div>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">
              Please try again from the app or contact support.
            </p>
          </div>
        </body>
        </html>
      `);
    }

    // Return success page
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Calendar Connected</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
            animation: checkmark 0.6s ease-in-out;
          }
          @keyframes checkmark {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .success-badge {
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            display: inline-block;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <div class="success-badge">Success!</div>
          <h1>Google Calendar Connected</h1>
          <p>Your Google Calendar has been successfully connected to StyloAI!</p>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            You can close this page and return to the app.<br>
            Your calendar events will now be used for outfit suggestions.
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Calendar OAuth Error:', error);
    
    // Return error page
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Connection Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            line-height: 1.6;
          }
          .error-details {
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            font-size: 12px;
            color: #c33;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>Connection Failed</h1>
          <p>There was an error connecting your Google Calendar.</p>
          <div class="error-details">
            ${error.message || 'Unknown error'}
          </div>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">
            Please try again from the app or contact support if the issue persists.
          </p>
        </div>
      </body>
      </html>
    `);
  }
};

/**
 * Manual code exchange endpoint (for when callback doesn't work)
 */
const exchangeCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Save tokens to user
    await saveCalendarTokens(userId, tokens);

    console.log('Calendar connected via manual code exchange for user:', userId);

    res.json({
      success: true,
      message: 'Google Calendar connected successfully',
    });
  } catch (error) {
    console.error('Manual code exchange error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to exchange authorization code',
    });
  }
};

/**
 * Get today's calendar events
 */
const getTodayEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await getTodaysEvents(userId);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get week's calendar events
 */
const getWeekEventsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weekStartDate } = req.query;

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'weekStartDate is required',
      });
    }

    const events = await getWeekEvents(userId, new Date(weekStartDate));

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Check calendar connection status
 */
const checkConnection = async (req, res) => {
  try {
    const userId = req.user._id;
    const connected = await isCalendarConnected(userId);

    res.json({
      success: true,
      data: {
        isConnected: connected,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Disconnect Google Calendar
 */
const disconnect = async (req, res) => {
  try {
    const userId = req.user._id;
    await disconnectCalendar(userId);

    res.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAuthUrl: getAuthUrlController,
  handleCallback,
  exchangeCode,
  getTodayEvents,
  getWeekEvents: getWeekEventsController,
  checkConnection,
  disconnect,
};
