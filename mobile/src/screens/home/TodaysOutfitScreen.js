import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {dailyOutfitService} from '../../services/api/dailyOutfitService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const TodaysOutfitScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [outfit, setOutfit] = useState(null);
  const [weather, setWeather] = useState(null);
  const [userMood, setUserMood] = useState('casual');
  const {user} = useSelector((state) => state.auth);

  useEffect(() => {
    loadTodaysOutfit();
  }, []);

  const loadTodaysOutfit = async () => {
    try {
      setLoading(true);
      const response = await dailyOutfitService.getToday();
      if (response.success && response.data) {
        setOutfit(response.data);
        if (response.data.weather) {
          setWeather(response.data.weather);
        }
      }
    } catch (error) {
      console.error('Error loading today\'s outfit:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOutfit = async () => {
    try {
      setGenerating(true);
      const response = await dailyOutfitService.generateToday(
        userMood,
        null, // city - can be enhanced with location
        [], // calendarEvents - can be enhanced with calendar integration
        false
      );

      if (response.success) {
        setOutfit(response.data.dailyOutfit);
        if (response.data.weather) {
          setWeather(response.data.weather);
        }
        Alert.alert('Success', 'Today\'s outfit generated!');
      } else {
        Alert.alert('Error', response.message || 'Failed to generate outfit');
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate outfit');
    } finally {
      setGenerating(false);
    }
  };

  const markAsWorn = async () => {
    if (!outfit) return;

    Alert.prompt(
      'Rate Your Outfit',
      'How would you rate this outfit? (1-5)',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Submit',
          onPress: async (rating) => {
            try {
              const ratingNum = parseInt(rating);
              if (ratingNum < 1 || ratingNum > 5) {
                Alert.alert('Error', 'Rating must be between 1 and 5');
                return;
              }

              const response = await dailyOutfitService.markWorn(
                outfit._id,
                ratingNum,
                null
              );

              if (response.success) {
                Alert.alert('Success', 'Outfit marked as worn!');
                loadTodaysOutfit();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to mark outfit as worn');
            }
          },
        },
      ],
      'plain-text',
      '5'
    );
  };

  const moods = [
    {value: 'casual', label: 'Casual'},
    {value: 'professional', label: 'Professional'},
    {value: 'energetic', label: 'Energetic'},
    {value: 'relaxed', label: 'Relaxed'},
    {value: 'festive', label: 'Festive'},
  ];

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
        <Text style={styles.title}>What Should I Wear Today?</Text>
        <Text style={styles.subtitle}>Get your perfect outfit suggestion</Text>
      </View>

      {weather && (
        <Card style={styles.weatherCard}>
          <View style={styles.weatherRow}>
            <Icon name="partly-sunny" size={24} color={colors.primary} />
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
          </View>
        </Card>
      )}

      {!outfit ? (
        <Card style={styles.generateCard}>
          <Text style={styles.moodLabel}>How are you feeling today?</Text>
          <View style={styles.moodContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  userMood === mood.value && styles.moodButtonActive,
                ]}
                onPress={() => setUserMood(mood.value)}>
                <Text
                  style={[
                    styles.moodText,
                    userMood === mood.value && styles.moodTextActive,
                  ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title={generating ? 'Generating...' : 'Generate Today\'s Outfit'}
            onPress={generateOutfit}
            disabled={generating}
          />
        </Card>
      ) : (
        <>
          <Card style={styles.outfitCard}>
            <View style={styles.outfitHeader}>
              <Text style={styles.outfitTitle}>Your Outfit for Today</Text>
              {outfit.isWorn && (
                <View style={styles.wornBadge}>
                  <Text style={styles.wornText}>Worn</Text>
                </View>
              )}
            </View>

            {outfit.outfitId && outfit.outfitId.items && (
              <View style={styles.itemsContainer}>
                {outfit.outfitId.items.map((item, index) => (
                  <Image
                    key={index}
                    source={{uri: item.imageUrl}}
                    style={styles.itemImage}
                  />
                ))}
              </View>
            )}

            {outfit.outfitId && outfit.outfitId.shoes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shoes</Text>
                <Image
                  source={{uri: outfit.outfitId.shoes.imageUrl}}
                  style={styles.itemImage}
                />
              </View>
            )}

            {outfit.outfitId && outfit.outfitId.hairstyleSuggestion && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hairstyle Suggestion</Text>
                <Text style={styles.hairstyleText}>
                  {outfit.outfitId.hairstyleSuggestion}
                </Text>
              </View>
            )}

            {!outfit.isWorn && (
              <Button
                title="Mark as Worn"
                onPress={markAsWorn}
                style={styles.markButton}
              />
            )}
          </Card>

          <Button
            title="Generate New Outfit"
            variant="secondary"
            onPress={generateOutfit}
            disabled={generating}
          />
        </>
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
  weatherCard: {
    marginBottom: 16,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  weatherCondition: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  generateCard: {
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  moodText: {
    fontSize: 14,
    color: colors.text,
  },
  moodTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  outfitCard: {
    marginBottom: 16,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  wornBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  wornText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  hairstyleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  markButton: {
    marginTop: 8,
  },
});

export default TodaysOutfitScreen;

