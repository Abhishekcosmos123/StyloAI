import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {generateOutfit, saveOutfit} from '../../store/slices/outfitSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';

const STYLE_TYPES = ['Casual', 'Attractive', 'Traditional', 'Trend Aligned'];
const OCCASIONS = ['Office', 'Party', 'Daily', 'Wedding', 'Travel'];

const OutfitGeneratorScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {currentOutfit, loading} = useSelector((state) => state.outfit);
  const [styleType, setStyleType] = useState('Casual');
  const [occasion, setOccasion] = useState(null);

  const handleGenerate = () => {
    dispatch(generateOutfit({styleType, occasion, weather: null}));
  };

  const handleSave = async () => {
    if (!currentOutfit) return;

    try {
      await dispatch(saveOutfit(currentOutfit._id)).unwrap();
      Alert.alert('Success', 'Outfit saved successfully');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to save outfit');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Card style={styles.selectorCard}>
        <Text style={styles.label}>Style Type</Text>
        <View style={styles.optionsContainer}>
          {STYLE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                styleType === type && styles.selectedOption,
              ]}
              onPress={() => setStyleType(type)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.optionText,
                  styleType === type && styles.selectedOptionText,
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, styles.sectionSpacing]}>Occasion (Optional)</Text>
        <View style={styles.optionsContainer}>
          {OCCASIONS.map((occ) => (
            <TouchableOpacity
              key={occ}
              style={[
                styles.optionButton,
                occasion === occ && styles.selectedOption,
              ]}
              onPress={() => setOccasion(occasion === occ ? null : occ)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.optionText,
                  occasion === occ && styles.selectedOptionText,
                ]}>
                {occ}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Generate Outfit"
          onPress={handleGenerate}
          loading={loading}
          style={styles.generateButton}
        />
      </Card>

      {loading && (
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Generating your perfect outfit...</Text>
        </Card>
      )}

      {currentOutfit && !loading && (
        <Card style={styles.outfitCard}>
          <View style={styles.outfitHeader}>
            <Text style={styles.outfitTitle}>Your Outfit</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Main Outfit Items */}
          {currentOutfit.items && currentOutfit.items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Outfit</Text>
              <View style={styles.imagesContainer}>
                {currentOutfit.items.map((item, index) => (
                  <Image
                    key={index}
                    source={{uri: item.imageUrl}}
                    style={styles.outfitImage}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Shoes */}
          {currentOutfit.shoes && currentOutfit.shoes.imageUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shoes</Text>
              <Image
                source={{uri: currentOutfit.shoes.imageUrl}}
                style={styles.singleImage}
              />
            </View>
          )}

          {/* Accessories */}
          {currentOutfit.accessories &&
            currentOutfit.accessories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accessories</Text>
                <View style={styles.imagesContainer}>
                  {currentOutfit.accessories.map((acc, index) => (
                    <Image
                      key={index}
                      source={{uri: acc.imageUrl}}
                      style={styles.outfitImage}
                    />
                  ))}
                </View>
              </View>
            )}

          {/* Hairstyle Suggestion */}
          {currentOutfit.hairstyleSuggestion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hairstyle Suggestion</Text>
              <Text style={styles.hairstyleText}>
                {currentOutfit.hairstyleSuggestion}
              </Text>
            </View>
          )}
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
    paddingBottom: 32,
  },
  selectorCard: {
    marginBottom: 16,
    padding: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    margin: 6,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedOption: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: '600',
  },
  generateButton: {
    marginTop: 24,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 15,
  },
  outfitCard: {
    marginTop: 16,
    padding: 20,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  saveButton: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  outfitImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    margin: 6,
    resizeMode: 'cover',
  },
  singleImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    resizeMode: 'cover',
  },
  hairstyleText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default OutfitGeneratorScreen;

