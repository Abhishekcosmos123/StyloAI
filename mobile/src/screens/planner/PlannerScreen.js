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
import {plannerService} from '../../services/api/plannerService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const PlannerScreen = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planner, setPlanner] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    loadWeeklyPlan();
  }, [selectedWeek]);

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Get Monday
    return new Date(d.setDate(diff));
  };

  const loadWeeklyPlan = async () => {
    try {
      setLoading(true);
      const weekStart = getWeekStart(selectedWeek);
      const response = await plannerService.getPlan(weekStart.toISOString());
      
      if (response.success && response.data) {
        setPlanner(response.data);
      }
    } catch (error) {
      console.error('Error loading weekly plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    try {
      setGenerating(true);
      const weekStart = getWeekStart(selectedWeek);
      const response = await plannerService.generatePlan(
        weekStart.toISOString(),
        null, // city
        false // regenerate
      );

      if (response.success) {
        setPlanner(response.data);
        Alert.alert('Success', 'Weekly plan generated!');
      } else {
        Alert.alert('Error', response.message || 'Failed to generate plan');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedWeek(newDate);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDayName = (date) => {
    return new Date(date).toLocaleDateString('en-US', {weekday: 'long'});
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
        <Text style={styles.title}>Weekly Outfit Planner</Text>
        <Text style={styles.subtitle}>Plan your outfits for the week</Text>
      </View>

      <View style={styles.weekNavigator}>
        <TouchableOpacity onPress={() => navigateWeek(-1)}>
          <Icon name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.weekText}>
          {formatDate(getWeekStart(selectedWeek))} -{' '}
          {formatDate(new Date(getWeekStart(selectedWeek).getTime() + 6 * 24 * 60 * 60 * 1000))}
        </Text>
        <TouchableOpacity onPress={() => navigateWeek(1)}>
          <Icon name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {!planner ? (
        <Card style={styles.generateCard}>
          <Text style={styles.generateText}>
            Generate your weekly outfit plan to see suggestions for each day
          </Text>
          <Button
            title={generating ? 'Generating...' : 'Generate Weekly Plan'}
            onPress={generatePlan}
            disabled={generating}
          />
        </Card>
      ) : (
        <>
          {planner.outfits && planner.outfits.length > 0 ? (
            planner.outfits.map((dayOutfit, index) => (
              <Card key={index} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={styles.dayName}>{getDayName(dayOutfit.date)}</Text>
                    <Text style={styles.dayDate}>{formatDate(dayOutfit.date)}</Text>
                  </View>
                  {dayOutfit.isConfirmed && (
                    <Icon name="checkmark-circle" size={24} color={colors.accent} />
                  )}
                </View>

                {dayOutfit.weather && (
                  <View style={styles.weatherInfo}>
                    <Icon name="partly-sunny" size={16} color={colors.textSecondary} />
                    <Text style={styles.weatherText}>
                      {dayOutfit.weather.temperature}°C, {dayOutfit.weather.condition}
                    </Text>
                  </View>
                )}

                {dayOutfit.outfitId ? (
                  <View style={styles.outfitPreview}>
                    {dayOutfit.outfitId.items &&
                      dayOutfit.outfitId.items.slice(0, 3).map((item, idx) => (
                        <Image
                          key={idx}
                          source={{uri: item.imageUrl}}
                          style={styles.previewImage}
                        />
                      ))}
                  </View>
                ) : (
                  <Text style={styles.noOutfitText}>No outfit generated</Text>
                )}

                {dayOutfit.occasion && (
                  <View style={styles.occasionTag}>
                    <Text style={styles.occasionText}>{dayOutfit.occasion}</Text>
                  </View>
                )}
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No outfits planned for this week</Text>
              <Button
                title="Generate Plan"
                onPress={generatePlan}
                disabled={generating}
              />
            </Card>
          )}
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
  weekNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  generateCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  generateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  dayCard: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  dayDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  weatherText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  outfitPreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  noOutfitText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  occasionTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occasionText: {
    fontSize: 12,
    color: colors.text,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default PlannerScreen;
