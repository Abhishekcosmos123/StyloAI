import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {gapDetectionService} from '../../services/api/gapDetectionService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const GapDetectionScreen = () => {
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [gaps, setGaps] = useState(null);

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    try {
      setLoading(true);
      const response = await gapDetectionService.getGaps();
      if (response.success && response.data) {
        setGaps(response.data);
      }
    } catch (error) {
      console.error('Error loading gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectGaps = async () => {
    try {
      setDetecting(true);
      const response = await gapDetectionService.detectGaps();

      if (response.success) {
        setGaps(response.data);
        Alert.alert('Success', 'Wardrobe gaps detected!');
      } else {
        Alert.alert('Error', response.message || 'Failed to detect gaps');
      }
    } catch (error) {
      console.error('Error detecting gaps:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to detect gaps');
    } finally {
      setDetecting(false);
    }
  };

  const openShoppingLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#3498DB';
      default:
        return colors.textSecondary;
    }
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
        <Text style={styles.title}>Wardrobe Gap Detection</Text>
        <Text style={styles.subtitle}>
          AI identifies missing essentials in your wardrobe
        </Text>
      </View>

      {!gaps || !gaps.missingItems || gaps.missingItems.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Icon name="checkmark-circle" size={64} color={colors.accent} />
          <Text style={styles.emptyTitle}>No Gaps Detected</Text>
          <Text style={styles.emptyText}>
            Your wardrobe looks complete! Run analysis again to check for new gaps.
          </Text>
          <Button
            title={detecting ? 'Analyzing...' : 'Detect Gaps'}
            onPress={detectGaps}
            disabled={detecting}
          />
        </Card>
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Analysis Summary</Text>
            <Text style={styles.summaryText}>
              Found {gaps.missingItems.length} missing item(s) in your wardrobe
            </Text>
            <Text style={styles.summaryDate}>
              Analyzed on {new Date(gaps.analysisDate).toLocaleDateString()}
            </Text>
          </Card>

          {gaps.missingItems.map((item, index) => (
            <Card key={index} style={styles.gapCard}>
              <View style={styles.gapHeader}>
                <View style={styles.gapHeaderLeft}>
                  <Text style={styles.gapCategory}>{item.category}</Text>
                  <Text style={styles.gapName}>{item.itemName}</Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    {backgroundColor: getPriorityColor(item.priority)},
                  ]}>
                  <Text style={styles.priorityText}>
                    {item.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.gapDescription}>{item.description}</Text>

              {item.suggestedColors && item.suggestedColors.length > 0 && (
                <View style={styles.colorsSection}>
                  <Text style={styles.colorsLabel}>Suggested Colors:</Text>
                  <View style={styles.colorsContainer}>
                    {item.suggestedColors.map((color, idx) => (
                      <View key={idx} style={styles.colorTag}>
                        <Text style={styles.colorText}>{color}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {item.shoppingLinks && item.shoppingLinks.length > 0 && (
                <View style={styles.shoppingSection}>
                  <Text style={styles.shoppingLabel}>Shop on:</Text>
                  <View style={styles.linksContainer}>
                    {item.shoppingLinks.map((link, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.linkButton}
                        onPress={() => openShoppingLink(link.url)}>
                        <Icon name="open-outline" size={16} color={colors.primary} />
                        <Text style={styles.linkText}>{link.platform}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          ))}

          <Button
            title="Re-analyze Wardrobe"
            variant="secondary"
            onPress={detectGaps}
            disabled={detecting}
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
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gapCard: {
    marginBottom: 16,
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gapHeaderLeft: {
    flex: 1,
  },
  gapCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gapName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  gapDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  colorsSection: {
    marginBottom: 12,
  },
  colorsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorTag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  colorText: {
    fontSize: 12,
    color: colors.text,
    textTransform: 'capitalize',
  },
  shoppingSection: {
    marginTop: 8,
  },
  shoppingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  linkText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default GapDetectionScreen;

