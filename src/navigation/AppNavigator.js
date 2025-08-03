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



const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
       <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Become An Organiser" component={OrganiserScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="Invite User" component={InviteUserScreen} />
        <Stack.Screen name="Rate Us" component={RateUsScreen} />
        <Stack.Screen name="Privacy Policy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Location Permission Policy" component={LocationPermissionPolicyScreen} />
        <Stack.Screen name="Terms & Condition" component={TermsConditionScreen} />
        <Stack.Screen name="Logout" component={LogoutScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
