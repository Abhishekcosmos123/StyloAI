import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Clipboard,
  AppState,
} from 'react-native';
import {useSelector} from 'react-redux';
import {calendarService} from '../../services/api/calendarService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const CalendarSettingsScreen = ({navigation}) => {
  const {user} = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [authCode, setAuthCode] = useState('');

  useEffect(() => {
    checkConnection();
    loadTodaysEvents();
  }, []);

  // Listen for navigation focus to check connection
  useEffect(() => {
    const subscription = navigation.addListener('focus', () => {
      checkConnection();
      if (isConnected) {
        loadTodaysEvents();
      }
    });

    return subscription;
  }, [navigation, isConnected]);

  // Listen for app state changes (when user returns from browser)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground - user might have completed OAuth
        setTimeout(() => {
          checkConnection();
        }, 1000);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const response = await calendarService.checkConnection();
      if (response.success) {
        setIsConnected(response.data.isConnected);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysEvents = async () => {
    if (!isConnected) return;
    
    try {
      const response = await calendarService.getTodayEvents();
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      
      // First, get the auth URL
      let response;
      try {
        response = await calendarService.getAuthUrl();
      } catch (apiError) {
        console.error('API Error:', apiError);
        const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
        Alert.alert(
          'Configuration Error',
          `Failed to get authorization URL:\n\n${errorMessage}\n\nPlease check:\n1. Backend is running\n2. Google Calendar API is configured in .env\n3. You have premium subscription`,
          [{text: 'OK'}]
        );
        return;
      }
      
      if (!response || !response.success || !response.data?.authUrl) {
        const errorMsg = response?.message || 'Unknown error';
        Alert.alert(
          'Error',
          `Failed to get authorization URL:\n\n${errorMsg}\n\nPlease check your backend configuration:\n\n1. Add to backend/.env:\n   GOOGLE_CALENDAR_CLIENT_ID=your-client-id\n   GOOGLE_CALENDAR_CLIENT_SECRET=your-secret\n   GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5001/api/calendar/callback\n\n2. Restart backend server\n3. Ensure you have premium subscription`,
          [{text: 'OK'}]
        );
        return;
      }

      const authUrl = response.data.authUrl;
      console.log('Auth URL received:', authUrl);

      // Try to open the URL
      try {
        const supported = await Linking.canOpenURL(authUrl);
        console.log('Can open URL:', supported);
        
        if (supported) {
          await Linking.openURL(authUrl);
          
          // Don't show alert - user will see success page in browser
          // Auto-check connection when user returns to app
          // The success page in browser tells them to return to app
        } else {
          // If canOpenURL returns false, try opening anyway (sometimes it's too strict)
          try {
            await Linking.openURL(authUrl);
            // No alert needed - auto-detection will handle it
          } catch (openError) {
            console.error('Failed to open URL:', openError);
            Alert.alert(
              'Cannot Open Browser',
              `Unable to open browser. Please copy this URL and open it manually:\n\n${authUrl}`,
              [
                {
                  text: 'Copy URL',
                  onPress: () => {
                    try {
                      Clipboard.setString(authUrl);
                      Alert.alert('Success', 'URL copied to clipboard!');
                    } catch (clipError) {
                      console.error('Clipboard error:', clipError);
                      Alert.alert('Error', 'Failed to copy URL. Please note it down manually.');
                    }
                  },
                },
                {text: 'OK'},
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error opening URL:', error);
        Alert.alert(
          'Error',
          `Failed to open browser: ${error.message}\n\nPlease check:\n1. Backend is running\n2. Google Calendar API is configured\n3. OAuth credentials are correct`,
          [
            {
              text: 'Copy URL',
              onPress: () => {
                try {
                  Clipboard.setString(authUrl);
                  Alert.alert('Success', 'URL copied to clipboard!');
                } catch (clipError) {
                  console.error('Clipboard error:', clipError);
                  Alert.alert('Error', 'Failed to copy URL. Please note it down manually.');
                }
              },
            },
            {text: 'OK'},
          ]
        );
      }
    } catch (error) {
      console.error('Connection Error:', error);
      Alert.alert(
        'Error',
        `Failed to connect Google Calendar: ${error.message || 'Unknown error'}\n\nPlease check:\n1. You have premium subscription\n2. Backend is running\n3. Network connection is active`
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleManualCodeExchange = async () => {
    if (!authCode.trim()) {
      Alert.alert('Error', 'Please enter the authorization code');
      return;
    }

    // Extract code from URL if user pasted full URL
    let codeToUse = authCode.trim();
    const codeMatch = codeToUse.match(/[?&]code=([^&]+)/);
    if (codeMatch) {
      codeToUse = decodeURIComponent(codeMatch[1]);
    }

    // Remove any URL encoding or extra characters
    codeToUse = codeToUse.split('&')[0].split('?')[0];

    if (!codeToUse || codeToUse.length < 10) {
      Alert.alert(
        'Invalid Code',
        'The authorization code appears to be invalid. Please make sure you copied the entire code from the URL (the part after "code=").'
      );
      return;
    }

    try {
      setConnecting(true);
      const response = await calendarService.exchangeCode(codeToUse);
      
      if (response.success) {
        Alert.alert('Success', 'Google Calendar connected successfully!');
        setAuthCode('');
        setShowCodeInput(false);
        await checkConnection();
        await loadTodaysEvents();
      } else {
        Alert.alert('Error', response.message || 'Failed to connect calendar');
      }
    } catch (error) {
      console.error('Manual code exchange error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to exchange authorization code';
      Alert.alert(
        'Error',
        `${errorMessage}\n\nPlease check:\n1. The code is complete (starts with "4/")\n2. You copied it recently (codes expire quickly)\n3. Backend is running and accessible`
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Google Calendar',
      'Are you sure you want to disconnect your Google Calendar?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await calendarService.disconnect();
              if (response.success) {
                setIsConnected(false);
                setEvents([]);
                Alert.alert('Success', 'Google Calendar disconnected');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect calendar');
            }
          },
        },
      ]
    );
  };

  const getEventTypeColor = (type) => {
    const colorMap = {
      office: '#3498DB',
      party: '#E74C3C',
      travel: '#16A085',
      fitness: '#1ABC9C',
      casual: '#F39C12',
      other: '#95A5A6',
    };
    return colorMap[type] || colorMap.other;
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      office: 'briefcase',
      party: 'wine',
      travel: 'airplane',
      fitness: 'fitness',
      casual: 'cafe',
      other: 'calendar',
    };
    return icons[type] || icons.other;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Google Calendar Integration</Text>
        <Text style={styles.subtitle}>
          Connect your calendar to get smart outfit suggestions based on your
          events
        </Text>
      </View>

      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Icon
            name={isConnected ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={isConnected ? colors.accent : colors.textSecondary}
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isConnected
                ? 'Your calendar is synced'
                : 'Connect to enable calendar-based outfit suggestions'}
            </Text>
          </View>
        </View>

        {isConnected ? (
          <Button
            title="Disconnect"
            variant="secondary"
            onPress={handleDisconnect}
            style={styles.disconnectButton}
          />
        ) : (
          <>
            <Button
              title={connecting ? 'Connecting...' : 'Connect Google Calendar'}
              onPress={handleConnect}
              disabled={connecting}
              style={styles.connectButton}
            />
            <TouchableOpacity
              style={styles.manualLink}
              onPress={() => setShowCodeInput(!showCodeInput)}>
              <Text style={styles.manualLinkText}>
                {showCodeInput ? 'Hide Manual Entry' : '⚠️ Site Cannot Load? Enter Code Manually'}
              </Text>
            </TouchableOpacity>
            {!showCodeInput && (
              <Text style={styles.helpText}>
                If you see "Site cannot be loaded" after authorizing, tap above to enter the code manually from the URL.
              </Text>
            )}
          </>
        )}
      </Card>

      {showCodeInput && !isConnected && (
        <Card style={styles.codeInputCard}>
          <Text style={styles.codeInputTitle}>Enter Authorization Code</Text>
          <Text style={styles.codeInputDescription}>
            After authorizing, if you see "Site cannot be loaded", copy the code from the URL:
          </Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              1. Look at the browser address bar{'\n'}
              2. Find the part after <Text style={styles.codeHighlight}>code=</Text>{'\n'}
              3. Copy everything after <Text style={styles.codeHighlight}>code=</Text> until <Text style={styles.codeHighlight}>&</Text> or end{'\n'}
              4. Paste it below
            </Text>
            <Text style={styles.exampleText}>
              Example: If URL is{'\n'}
              <Text style={styles.exampleUrl}>
                ...callback?code=4/0ASc3gC3...&scope=...
              </Text>{'\n'}
              Copy: <Text style={styles.exampleCode}>4/0ASc3gC3...</Text>
            </Text>
          </View>
          <Input
            placeholder="Paste authorization code or full URL here"
            value={authCode}
            onChangeText={(text) => {
              // Auto-extract code from URL if user pastes full URL
              const codeMatch = text.match(/[?&]code=([^&]+)/);
              if (codeMatch) {
                setAuthCode(decodeURIComponent(codeMatch[1]));
              } else {
                setAuthCode(text);
              }
            }}
            style={styles.codeInput}
            multiline
          />
          <Button
            title="Connect with Code"
            onPress={handleManualCodeExchange}
            disabled={!authCode.trim() || connecting}
            style={styles.codeButton}
          />
        </Card>
      )}

      {isConnected && (
        <>
          <Card style={styles.eventsCard}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>Today's Events</Text>
              <Text style={styles.eventsCount}>
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </Text>
            </View>

            {events.length === 0 ? (
              <View style={styles.emptyEvents}>
                <Icon
                  name="calendar-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyEventsText}>No events today</Text>
              </View>
            ) : (
              events.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <View
                    style={[
                      styles.eventIconContainer,
                      {backgroundColor: getEventTypeColor(event.type) + '20'},
                    ]}>
                    <Icon
                      name={getEventTypeIcon(event.type)}
                      size={20}
                      color={getEventTypeColor(event.type)}
                    />
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {new Date(event.start).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>
                        <Icon name="location" size={12} color={colors.textSecondary} />{' '}
                        {event.location}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.eventTypeBadge,
                      {backgroundColor: getEventTypeColor(event.type) + '20'},
                    ]}>
                    <Text
                      style={[
                        styles.eventTypeText,
                        {color: getEventTypeColor(event.type)},
                      ]}>
                      {event.type}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card style={styles.infoCard}>
            <Icon name="information-circle" size={20} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>How It Works</Text>
              <Text style={styles.infoText}>
                Your calendar events are automatically analyzed to suggest
                appropriate outfits. Events are categorized as Office, Party,
                Travel, Fitness, or Casual to match your style needs.
              </Text>
            </View>
          </Card>
        </>
      )}

      {!isConnected && (
        <Card style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits of Connecting:</Text>
          {[
            'Smart outfit suggestions based on your schedule',
            'Automatic occasion detection from calendar events',
            'Weekly planner syncs with your calendar',
            'Daily outfit recommendations consider your events',
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Icon name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  connectButton: {
    marginTop: 8,
  },
  disconnectButton: {
    marginTop: 8,
  },
  eventsCard: {
    marginBottom: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  eventsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyEvents: {
    alignItems: 'center',
    padding: 32,
  },
  emptyEventsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  benefitsCard: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  manualLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  manualLinkText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  codeInputCard: {
    marginBottom: 16,
  },
  codeInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  codeInputDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  instructionBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  codeHighlight: {
    fontFamily: 'monospace',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  exampleText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  exampleUrl: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
  },
  exampleCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  codeInput: {
    marginBottom: 16,
    minHeight: 80,
  },
  codeButton: {
    marginTop: 8,
  },
});

export default CalendarSettingsScreen;

