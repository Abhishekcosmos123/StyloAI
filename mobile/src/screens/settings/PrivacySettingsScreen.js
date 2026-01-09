import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const PrivacySettingsScreen = () => {
  const [photoStorage, setPhotoStorage] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  const handleDeleteAllPhotos = () => {
    Alert.alert(
      'Delete All Photos',
      'This will permanently delete all your uploaded photos. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement photo deletion
            Alert.alert('Info', 'Photo deletion feature coming soon');
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data including outfits, wardrobe, and history.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement data deletion
            Alert.alert('Info', 'Data deletion feature coming soon');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy & Control</Text>
        <Text style={styles.subtitle}>
          Manage your privacy settings and data
        </Text>
      </View>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Photo Storage</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="images" size={20} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Private Photo Storage</Text>
              <Text style={styles.settingDescription}>
                Your photos are stored privately and securely
              </Text>
            </View>
          </View>
          <Switch
            value={photoStorage}
            onValueChange={setPhotoStorage}
            trackColor={{false: colors.lightGray, true: colors.primary}}
          />
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteAllPhotos}>
          <Icon name="trash" size={20} color="#E74C3C" />
          <Text style={styles.actionButtonText}>Delete All Photos</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Data Sharing</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="share-social" size={20} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Allow Data Sharing</Text>
              <Text style={styles.settingDescription}>
                Share anonymized data to improve app experience
              </Text>
            </View>
          </View>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{false: colors.lightGray, true: colors.primary}}
          />
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="eye" size={20} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Public Profile</Text>
              <Text style={styles.settingDescription}>
                Make your profile visible to other users
              </Text>
            </View>
          </View>
          <Switch
            value={publicProfile}
            onValueChange={setPublicProfile}
            trackColor={{false: colors.lightGray, true: colors.primary}}
          />
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteAllData}>
          <Icon name="trash" size={20} color="#E74C3C" />
          <Text style={styles.actionButtonText}>Delete All Data</Text>
        </TouchableOpacity>
        <Text style={styles.warningText}>
          This will permanently delete all your data. This action cannot be
          undone.
        </Text>
      </Card>

      <Card style={styles.infoCard}>
        <Icon name="information-circle" size={24} color={colors.primary} />
        <Text style={styles.infoText}>
          Your privacy is important to us. All your data is encrypted and stored
          securely. You can delete your data at any time.
        </Text>
      </Card>
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
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default PrivacySettingsScreen;

