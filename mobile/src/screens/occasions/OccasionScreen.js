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
import {occasionService} from '../../services/api/occasionService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const OccasionScreen = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [outfit, setOutfit] = useState(null);
  const [guides, setGuides] = useState([]);

  const occasions = [
    {value: 'Office', icon: 'briefcase', color: '#3498DB'},
    {value: 'Party', icon: 'wine', color: '#E74C3C'},
    {value: 'Wedding', icon: 'heart', color: '#9B59B6'},
    {value: 'Interview', icon: 'person', color: '#F39C12'},
    {value: 'Festival', icon: 'musical-notes', color: '#1ABC9C'},
    {value: 'Travel', icon: 'airplane', color: '#16A085'},
  ];

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const response = await occasionService.getGuides();
      if (response.success) {
        setGuides(response.data);
      }
    } catch (error) {
      console.error('Error loading guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOutfit = async (occasion) => {
    try {
      setGenerating(true);
      setSelectedOccasion(occasion);
      const response = await occasionService.generateOutfit(occasion);

      if (response.success) {
        setOutfit(response.data);
        Alert.alert('Success', 'Outfit generated for ' + occasion + '!');
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

  const getGuide = (occasion) => {
    return guides.find(g => g.occasion === occasion)?.guide || null;
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
        <Text style={styles.title}>Occasion-Wise Styling</Text>
        <Text style={styles.subtitle}>Get perfect outfits for any occasion</Text>
      </View>

      <View style={styles.occasionsGrid}>
        {occasions.map((occasion) => (
          <TouchableOpacity
            key={occasion.value}
            style={styles.occasionCard}
            onPress={() => generateOutfit(occasion.value)}>
            <Icon name={occasion.icon} size={32} color={occasion.color} />
            <Text style={styles.occasionName}>{occasion.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {outfit && (
        <Card style={styles.outfitCard}>
          <Text style={styles.outfitTitle}>
            Outfit for {selectedOccasion}
          </Text>

          {outfit.outfit && outfit.outfit.items && (
            <View style={styles.itemsContainer}>
              {outfit.outfit.items.map((item, index) => (
                <Image
                  key={index}
                  source={{uri: item.imageUrl}}
                  style={styles.itemImage}
                />
              ))}
            </View>
          )}

          {outfit.stylingGuide && (
            <View style={styles.guideSection}>
              <Text style={styles.guideTitle}>{outfit.stylingGuide.title}</Text>
              
              {outfit.stylingGuide.tips && outfit.stylingGuide.tips.length > 0 && (
                <View style={styles.tipsSection}>
                  <Text style={styles.sectionLabel}>Tips:</Text>
                  {outfit.stylingGuide.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Icon name="checkmark-circle" size={16} color={colors.accent} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {outfit.stylingGuide.do && outfit.stylingGuide.do.length > 0 && (
                <View style={styles.dosSection}>
                  <Text style={styles.sectionLabel}>Do:</Text>
                  {outfit.stylingGuide.do.map((item, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Icon name="add-circle" size={16} color={colors.accent} />
                      <Text style={styles.tipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {outfit.stylingGuide.dont && outfit.stylingGuide.dont.length > 0 && (
                <View style={styles.dontsSection}>
                  <Text style={styles.sectionLabel}>Don't:</Text>
                  {outfit.stylingGuide.dont.map((item, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Icon name="close-circle" size={16} color={colors.error || '#E74C3C'} />
                      <Text style={styles.tipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card>
      )}

      {generating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Generating outfit...</Text>
        </View>
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
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  occasionCard: {
    width: '47%',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  occasionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  outfitCard: {
    marginBottom: 16,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
  guideSection: {
    marginTop: 16,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  tipsSection: {
    marginBottom: 12,
  },
  dosSection: {
    marginBottom: 12,
  },
  dontsSection: {
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
});

export default OccasionScreen;

