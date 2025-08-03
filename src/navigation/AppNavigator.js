import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResultsScreen from '../screens/ResultsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import LogoutScreen from '../screens/LogoutScreen';
import SearchScreen from '../screens/SearchScreen';
import OrganiserScreen from '../screens/OrganiserScreen';
import InviteUserScreen from '../screens/InviteUserScreen';
import RateUsScreen from '../screens/RateUsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import LocationPermissionPolicyScreen from '../screens/LocationPermissionPolicyScreen';
import TermsConditionScreen from '../screens/TermsConditionScreen';
import SplashScreen from '../screens/SplashScreen';
import CustomDrawer from "../screens/CustomDrawer"; 
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/Notifications';
import AboutAppScreen from '../screens/AboutAppScreen';
import JoinEventScreen from '../screens/JoinEvent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawer {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Search" component={SearchScreen} />
      <Drawer.Screen name="Results" component={ResultsScreen} />
      <Drawer.Screen name="Become An Organiser" component={OrganiserScreen} />
      <Drawer.Screen name="Apply or Join Event" component={JoinEventScreen} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="Invite User" component={InviteUserScreen} />
      <Drawer.Screen name="Rate Us" component={RateUsScreen} />
      <Drawer.Screen name="Privacy Policy" component={PrivacyPolicyScreen} />
      <Drawer.Screen name="Location Permission Policy" component={LocationPermissionPolicyScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Terms & Condition" component={TermsConditionScreen} />
      <Drawer.Screen name="About App" component={AboutAppScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
      </Stack.Navigator>

    </NavigationContainer>
  );
}
