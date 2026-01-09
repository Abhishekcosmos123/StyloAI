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

const ProfileScreen = ({navigation}) => {
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
            <View style={styles.premiumRow}>
              <Text style={styles.value}>
                {profile.isPremium ? 'Premium User' : 'Free User'}
              </Text>
              {!profile.isPremium && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Payment')}>
                  <Text style={styles.upgradeText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Card>

      <Card style={styles.settingsCard}>
        {!profile?.isPremium && (
          <TouchableOpacity
            style={[styles.settingItem, styles.premiumSettingItem]}
            onPress={() => navigation.navigate('Payment')}>
            <View style={styles.premiumSettingLeft}>
              <Text style={styles.premiumSettingText}>Upgrade to Premium</Text>
              <Text style={styles.premiumSettingSubtext}>Unlock all features</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingText}>Settings</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('StyleHistory')}>
          <Text style={styles.settingText}>Style History</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('GapDetection')}>
          <Text style={styles.settingText}>Wardrobe Gaps</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Occasions')}>
          <Text style={styles.settingText}>Occasions</Text>
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
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumSettingItem: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  premiumSettingLeft: {
    flex: 1,
  },
  premiumSettingText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  premiumSettingSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default ProfileScreen;

