import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import CustomDrawerContent from '../components/CustomDrawerContent';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
// Add all other screens as needed...

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: true }}
      >
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="Search" component={SearchScreen} />
        {/* Add other drawer screens here */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
