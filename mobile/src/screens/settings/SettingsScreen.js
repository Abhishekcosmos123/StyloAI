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
import {useDispatch} from 'react-redux';
import {logout} from '../../store/slices/authSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Info', 'Account deletion feature coming soon');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export feature coming soon');
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Cache cleared successfully');
  };

  const settingsSections = [
    {
      title: 'Privacy & Data',
      items: [
        {
          icon: 'lock-closed',
          label: 'Privacy Settings',
          onPress: () => navigation.navigate('PrivacySettings'),
        },
        {
          icon: 'download',
          label: 'Export My Data',
          onPress: handleExportData,
        },
        {
          icon: 'trash',
          label: 'Delete Account',
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{false: colors.lightGray, true: colors.primary}}
            />
          ),
        },
        {
          icon: 'mail',
          label: 'Email Notifications',
          rightComponent: (
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{false: colors.lightGray, true: colors.primary}}
            />
          ),
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: 'stats-chart',
          label: 'Analytics',
          rightComponent: (
            <Switch
              value={analyticsEnabled}
              onValueChange={setAnalyticsEnabled}
              trackColor={{false: colors.lightGray, true: colors.primary}}
            />
          ),
        },
        {
          icon: 'refresh',
          label: 'Clear Cache',
          onPress: handleClearCache,
        },
        {
          icon: 'information-circle',
          label: 'About',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={[
                styles.settingItem,
                itemIndex < section.items.length - 1 && styles.settingItemBorder,
              ]}
              onPress={item.onPress}
              disabled={!item.onPress}>
              <View style={styles.settingLeft}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={item.destructive ? '#E74C3C' : colors.primary}
                />
                <Text
                  style={[
                    styles.settingLabel,
                    item.destructive && styles.destructiveText,
                  ]}>
                  {item.label}
                </Text>
              </View>
              {item.rightComponent ? (
                item.rightComponent
              ) : (
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>
      ))}

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
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  destructiveText: {
    color: '#E74C3C',
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;

