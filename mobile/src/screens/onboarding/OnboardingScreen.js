import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setupProfile} from '../../store/slices/profileSlice';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';

const GENDERS = ['Men', 'Women', 'Unisex'];
const STYLE_GOALS = ['Professional', 'Casual', 'Trendy', 'Elegant', 'Minimal'];
const OCCASIONS = ['Office', 'Party', 'Daily', 'Wedding', 'Travel'];

const OnboardingScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {loading} = useSelector((state) => state.profile);
  const [gender, setGender] = useState(null);
  const [styleGoals, setStyleGoals] = useState([]);
  const [occasions, setOccasions] = useState([]);

  const toggleSelection = (array, setArray, item) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleContinue = () => {
    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    if (styleGoals.length === 0) {
      Alert.alert('Error', 'Please select at least one style goal');
      return;
    }

    if (occasions.length === 0) {
      Alert.alert('Error', 'Please select at least one occasion');
      return;
    }

    dispatch(setupProfile({gender, styleGoals, occasions}));
    navigation.navigate('BodyFaceUpload');
  };

  const SelectableItem = ({item, selected, onPress}) => (
    <TouchableOpacity
      style={[styles.selectableItem, selected && styles.selectedItem]}
      onPress={onPress}>
      <Text style={[styles.selectableText, selected && styles.selectedText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Let's get started!</Text>
        <Text style={styles.subtitle}>Tell us about your style preferences</Text>
      </View>

      {/* Gender Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.optionsContainer}>
          {GENDERS.map((item) => (
            <SelectableItem
              key={item}
              item={item}
              selected={gender === item}
              onPress={() => setGender(item)}
            />
          ))}
        </View>
      </View>

      {/* Style Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style Goals (Select all that apply)</Text>
        <View style={styles.optionsContainer}>
          {STYLE_GOALS.map((item) => (
            <SelectableItem
              key={item}
              item={item}
              selected={styleGoals.includes(item)}
              onPress={() => toggleSelection(styleGoals, setStyleGoals, item)}
            />
          ))}
        </View>
      </View>

      {/* Occasions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Occasions (Select all that apply)</Text>
        <View style={styles.optionsContainer}>
          {OCCASIONS.map((item) => (
            <SelectableItem
              key={item}
              item={item}
              selected={occasions.includes(item)}
              onPress={() => toggleSelection(occasions, setOccasions, item)}
            />
          ))}
        </View>
      </View>

      <Button title="Continue" onPress={handleContinue} loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectableItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  selectableText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default OnboardingScreen;

