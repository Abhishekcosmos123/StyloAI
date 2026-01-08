import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getOutfitHistory, deleteOutfit, saveOutfit} from '../../store/slices/outfitSlice';
import Card from '../../components/Card';
import {colors} from '../../constants/colors';

const OutfitHistoryScreen = () => {
  const dispatch = useDispatch();
  const {history, loading} = useSelector((state) => state.outfit);

  useEffect(() => {
    dispatch(getOutfitHistory(false));
  }, [dispatch]);

  const handleSave = async (outfitId) => {
    try {
      await dispatch(saveOutfit(outfitId)).unwrap();
      Alert.alert('Success', 'Outfit saved successfully');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to save outfit');
    }
  };

  const handleDelete = (outfitId) => {
    Alert.alert('Delete Outfit', 'Are you sure you want to delete this outfit?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteOutfit(outfitId)).unwrap();
          } catch (error) {
            Alert.alert('Error', error || 'Failed to delete outfit');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No outfits yet</Text>
        <Text style={styles.emptySubtext}>Generate your first outfit to see it here</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {history.map((outfit) => (
        <Card key={outfit._id} style={styles.outfitCard}>
          <View style={styles.outfitHeader}>
            <View>
              <Text style={styles.outfitStyle}>{outfit.styleType}</Text>
              {outfit.occasion && (
                <Text style={styles.outfitOccasion}>{outfit.occasion}</Text>
              )}
            </View>
            <View style={styles.actions}>
              {!outfit.isSaved && (
                <TouchableOpacity
                  onPress={() => handleSave(outfit._id)}
                  style={styles.actionButton}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleDelete(outfit._id)}
                style={styles.actionButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {outfit.items && outfit.items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Outfit</Text>
              <View style={styles.imagesContainer}>
                {outfit.items.map((item, index) => (
                  <Image
                    key={index}
                    source={{uri: item.imageUrl}}
                    style={styles.outfitImage}
                  />
                ))}
              </View>
            </View>
          )}

          {outfit.shoes && outfit.shoes.imageUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shoes</Text>
              <Image
                source={{uri: outfit.shoes.imageUrl}}
                style={styles.singleImage}
              />
            </View>
          )}

          {outfit.accessories && outfit.accessories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accessories</Text>
              <View style={styles.imagesContainer}>
                {outfit.accessories.map((acc, index) => (
                  <Image
                    key={index}
                    source={{uri: acc.imageUrl}}
                    style={styles.outfitImage}
                  />
                ))}
              </View>
            </View>
          )}

          {outfit.hairstyleSuggestion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hairstyle</Text>
              <Text style={styles.hairstyleText}>{outfit.hairstyleSuggestion}</Text>
            </View>
          )}
        </Card>
      ))}
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  outfitCard: {
    marginBottom: 16,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  outfitStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  outfitOccasion: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveText: {
    color: colors.accent,
    fontWeight: '600',
  },
  deleteText: {
    color: colors.error,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  outfitImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  singleImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  hairstyleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default OutfitHistoryScreen;

