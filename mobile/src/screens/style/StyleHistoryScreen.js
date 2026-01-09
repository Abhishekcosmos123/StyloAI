import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {styleHistoryService} from '../../services/api/styleHistoryService';
import Card from '../../components/Card';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const StyleHistoryScreen = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'progress'

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'history') {
        const response = await styleHistoryService.getHistory(30);
        if (response.success) {
          setHistory(response.data || []);
        }
      } else {
        const response = await styleHistoryService.getProgress();
        if (response.success) {
          setProgress(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#F39C12' : colors.textSecondary}
        />
      );
    }
    return stars;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#1ABC9C';
    if (score >= 60) return '#3498DB';
    if (score >= 40) return '#F39C12';
    return '#E74C3C';
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
        <Text style={styles.title}>Style History & Progress</Text>
        <Text style={styles.subtitle}>Track your style journey</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
          onPress={() => setActiveTab('progress')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'progress' && styles.tabTextActive,
            ]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'history' ? (
        <>
          {history.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="time-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No style history yet</Text>
              <Text style={styles.emptySubtext}>
                Start wearing outfits to track your style journey
              </Text>
            </Card>
          ) : (
            history.map((item, index) => (
              <Card key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {new Date(item.wornDate).toLocaleDateString()}
                  </Text>
                  {item.rating && (
                    <View style={styles.ratingContainer}>
                      {getRatingStars(item.rating)}
                    </View>
                  )}
                </View>

                {item.outfitId && item.outfitId.items && (
                  <View style={styles.outfitPreview}>
                    {item.outfitId.items.slice(0, 3).map((outfitItem, idx) => (
                      <Image
                        key={idx}
                        source={{uri: outfitItem.imageUrl}}
                        style={styles.previewImage}
                      />
                    ))}
                  </View>
                )}

                {item.styleScore !== undefined && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Style Score:</Text>
                    <View
                      style={[
                        styles.scoreBadge,
                        {backgroundColor: getScoreColor(item.styleScore)},
                      ]}>
                      <Text style={styles.scoreText}>{item.styleScore}</Text>
                    </View>
                  </View>
                )}

                {item.feedback && (
                  <Text style={styles.feedbackText}>{item.feedback}</Text>
                )}

                {item.improvementSuggestions &&
                  item.improvementSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <Text style={styles.suggestionsLabel}>Suggestions:</Text>
                      {item.improvementSuggestions.map((suggestion, idx) => (
                        <View key={idx} style={styles.suggestionItem}>
                          <Icon
                            name="bulb-outline"
                            size={14}
                            color={colors.accent}
                          />
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </View>
                      ))}
                    </View>
                  )}
              </Card>
            ))
          )}
        </>
      ) : (
        <>
          {progress ? (
            <>
              <Card style={styles.progressCard}>
                <Text style={styles.progressTitle}>Your Style Progress</Text>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{progress.totalOutfits}</Text>
                    <Text style={styles.statLabel}>Total Outfits</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {progress.averageRating?.toFixed(1) || 'N/A'}
                    </Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        {color: getScoreColor(progress.averageStyleScore)},
                      ]}>
                      {progress.averageStyleScore || 'N/A'}
                    </Text>
                    <Text style={styles.statLabel}>Style Score</Text>
                  </View>
                </View>

                <View style={styles.trendContainer}>
                  <Text style={styles.trendLabel}>Trend:</Text>
                  <View
                    style={[
                      styles.trendBadge,
                      {
                        backgroundColor:
                          progress.improvementTrend === 'improving'
                            ? '#1ABC9C'
                            : progress.improvementTrend === 'declining'
                            ? '#E74C3C'
                            : colors.lightGray,
                      },
                    ]}>
                    <Icon
                      name={
                        progress.improvementTrend === 'improving'
                          ? 'trending-up'
                          : progress.improvementTrend === 'declining'
                          ? 'trending-down'
                          : 'remove'
                      }
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.trendText}>
                      {progress.improvementTrend || 'Neutral'}
                    </Text>
                  </View>
                </View>
              </Card>

              {progress.topOccasions && progress.topOccasions.length > 0 && (
                <Card style={styles.occasionsCard}>
                  <Text style={styles.cardTitle}>Top Occasions</Text>
                  {progress.topOccasions.map((occ, idx) => (
                    <View key={idx} style={styles.occasionItem}>
                      <Text style={styles.occasionName}>{occ.occasion}</Text>
                      <Text style={styles.occasionCount}>{occ.count} times</Text>
                    </View>
                  ))}
                </Card>
              )}

              {progress.recommendations &&
                progress.recommendations.length > 0 && (
                  <Card style={styles.recommendationsCard}>
                    <Text style={styles.cardTitle}>Recommendations</Text>
                    {progress.recommendations.map((rec, idx) => (
                      <View key={idx} style={styles.recommendationItem}>
                        <Icon
                          name="information-circle"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.recommendationText}>
                          {rec.message}
                        </Text>
                      </View>
                    ))}
                  </Card>
                )}
            </>
          ) : (
            <Card style={styles.emptyCard}>
              <Icon name="stats-chart-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No progress data yet</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your outfits to see progress
              </Text>
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
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  occasionsCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  occasionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  occasionName: {
    fontSize: 14,
    color: colors.text,
  },
  occasionCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recommendationsCard: {
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default StyleHistoryScreen;

