import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
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
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeScreen}
        options={{
          tabBarLabel: 'Wardrobe',
        }}
      />
      <Tab.Screen
        name="PlannerTab"
        component={PlannerScreen}
        options={{
          tabBarLabel: 'Planner',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

