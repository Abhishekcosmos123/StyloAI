import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getOutfitHistory} from '../../store/slices/outfitSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';

const HomeScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {history} = useSelector((state) => state.outfit);
  const {user} = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getOutfitHistory(false));
  }, [dispatch]);

  const recentOutfits = history.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0] || 'User'}!</Text>
        <Text style={styles.subtitle}>Ready to create your perfect outfit?</Text>
      </View>

      <Card style={styles.actionCard}>
        <Text style={styles.actionTitle}>Generate New Outfit</Text>
        <Text style={styles.actionDescription}>
          Get AI-powered outfit suggestions based on your wardrobe and style preferences
        </Text>
        <Button
          title="Generate Outfit"
          onPress={() => navigation.navigate('OutfitGenerator')}
        />
      </Card>

      {recentOutfits.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Outfits</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OutfitHistory')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentOutfits.map((outfit) => (
            <Card key={outfit._id} style={styles.outfitCard}>
              <View style={styles.outfitHeader}>
                <Text style={styles.outfitStyle}>{outfit.styleType}</Text>
                {outfit.occasion && (
                  <Text style={styles.outfitOccasion}>{outfit.occasion}</Text>
                )}
              </View>
              {outfit.items && outfit.items.length > 0 && (
                <View style={styles.outfitImages}>
                  {outfit.items.slice(0, 3).map((item, index) => (
                    <Image
                      key={index}
                      source={{uri: item.imageUrl}}
                      style={styles.outfitImage}
                    />
                  ))}
                </View>
              )}
            </Card>
          ))}
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionCard: {
    marginBottom: 24,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  outfitCard: {
    marginBottom: 12,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  outfitStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  outfitOccasion: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outfitImages: {
    flexDirection: 'row',
    gap: 8,
  },
  outfitImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
});

export default HomeScreen;

