import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {checkAuth} from '../store/slices/authSlice';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Onboarding Screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import BodyFaceUploadScreen from '../screens/onboarding/BodyFaceUploadScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import WardrobeScreen from '../screens/wardrobe/WardrobeScreen';
import PlannerScreen from '../screens/planner/PlannerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Outfit Screens
import OutfitGeneratorScreen from '../screens/home/OutfitGeneratorScreen';
import OutfitHistoryScreen from '../screens/home/OutfitHistoryScreen';
import TodaysOutfitScreen from '../screens/home/TodaysOutfitScreen';

// Feature Screens
import OccasionScreen from '../screens/occasions/OccasionScreen';
import GapDetectionScreen from '../screens/gaps/GapDetectionScreen';
import StyleHistoryScreen from '../screens/style/StyleHistoryScreen';

// Settings Screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import PrivacySettingsScreen from '../screens/settings/PrivacySettingsScreen';

// Payment Screens
import PaymentScreen from '../screens/payment/PaymentScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498DB',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E1E8ED',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeScreen}
        options={{
          tabBarLabel: 'Wardrobe',
          tabBarIcon: ({color, size}) => (
            <Icon name="shirt" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PlannerTab"
        component={PlannerScreen}
        options={{
          tabBarLabel: 'Planner',
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  const {isAuthenticated, user} = useSelector((state) => state.auth);
  const {profile} = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Check if user needs onboarding
  // Onboarding is complete if profile has gender (set during onboarding screen)
  const needsOnboarding = isAuthenticated && user && !profile?.gender;

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : needsOnboarding ? (
        // Onboarding Stack
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="BodyFaceUpload" component={BodyFaceUploadScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="OutfitGenerator"
            component={OutfitGeneratorScreen}
            options={{headerShown: true, title: 'Generate Outfit'}}
          />
          <Stack.Screen
            name="OutfitHistory"
            component={OutfitHistoryScreen}
            options={{headerShown: true, title: 'Outfit History'}}
          />
          <Stack.Screen
            name="TodaysOutfit"
            component={TodaysOutfitScreen}
            options={{headerShown: true, title: "What Should I Wear Today?"}}
          />
          <Stack.Screen
            name="Occasions"
            component={OccasionScreen}
            options={{headerShown: true, title: 'Occasion Styling'}}
          />
          <Stack.Screen
            name="GapDetection"
            component={GapDetectionScreen}
            options={{headerShown: true, title: 'Wardrobe Gaps'}}
          />
          <Stack.Screen
            name="StyleHistory"
            component={StyleHistoryScreen}
            options={{headerShown: true, title: 'Style History'}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{headerShown: true, title: 'Settings'}}
          />
          <Stack.Screen
            name="PrivacySettings"
            component={PrivacySettingsScreen}
            options={{headerShown: true, title: 'Privacy Settings'}}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{headerShown: true, title: 'Upgrade to Premium'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

