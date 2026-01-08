import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {useDispatch} from 'react-redux';
import ImagePicker from '../../components/ImagePicker';
import Button from '../../components/Button';
import {analysisService} from '../../services/api/analysisService';
import {getProfile} from '../../store/slices/profileSlice';
import {checkAuth} from '../../store/slices/authSlice';
import {colors} from '../../constants/colors';

const BodyFaceUploadScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [bodyImage, setBodyImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!bodyImage) {
      Alert.alert('Error', 'Body image is required');
      return;
    }

    setUploading(true);

    try {
      // Upload body image
      await analysisService.uploadBodyImage(bodyImage);

      // Upload face image if provided
      if (faceImage) {
        await analysisService.uploadFaceImage(faceImage);
      }

      // Refresh both profile and auth state to update onboarding status
      await Promise.all([
        dispatch(getProfile()),
        dispatch(checkAuth()),
      ]);
      
      // Show success message - navigation will happen automatically
      // when AppNavigator detects needsOnboarding is false
      Alert.alert('Success', 'Images uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    if (!bodyImage) {
      Alert.alert('Error', 'Body image is required');
      return;
    }

    handleUpload();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Your Photos</Text>
        <Text style={styles.subtitle}>
          Help us understand your body type and features for better styling
        </Text>
      </View>

      <View style={styles.uploadSection}>
        <ImagePicker
          label="Body Photo (Required)"
          imageUri={bodyImage}
          onImageSelected={setBodyImage}
        />

        <ImagePicker
          label="Face Photo (Optional)"
          imageUri={faceImage}
          onImageSelected={setFaceImage}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Skip Face Photo"
          variant="secondary"
          onPress={handleSkip}
          loading={uploading}
        />
        <Button
          title="Continue"
          onPress={handleUpload}
          loading={uploading}
          disabled={!bodyImage}
        />
      </View>
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
    lineHeight: 24,
  },
  uploadSection: {
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 12,
  },
});

export default BodyFaceUploadScreen;

