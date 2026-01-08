import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../store/slices/authSlice';
import {getProfile} from '../../store/slices/profileSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);
  const {profile} = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.profileSection}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>

        {user?.phone && (
          <View style={styles.profileSection}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>
        )}

        {profile?.gender && (
          <View style={styles.profileSection}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{profile.gender}</Text>
          </View>
        )}

        {profile?.styleGoals && profile.styleGoals.length > 0 && (
          <View style={styles.profileSection}>
            <Text style={styles.label}>Style Goals</Text>
            <View style={styles.tagsContainer}>
              {profile.styleGoals.map((goal, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile?.occasions && profile.occasions.length > 0 && (
          <View style={styles.profileSection}>
            <Text style={styles.label}>Occasions</Text>
            <View style={styles.tagsContainer}>
              {profile.occasions.map((occasion, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{occasion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile?.isPremium !== undefined && (
          <View style={styles.profileSection}>
            <Text style={styles.label}>Premium Status</Text>
            <Text style={styles.value}>
              {profile.isPremium ? 'Premium User' : 'Free User'}
            </Text>
          </View>
        )}
      </Card>

      <Card style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Edit Profile</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Help & Support</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      <Button
        title="Logout"
        variant="secondary"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;

