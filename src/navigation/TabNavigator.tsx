import React from 'react';
import LibraryStack from './LibraryStack';
import ModalPageStack from './ModalPageStack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import StartUpPage from '../screens/StartUpPage';
import SettingsPage from '../screens/SettingsPage';

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="main"
        component={StartUpPage}
        options={{tabBarLabel: 'Main', headerTitle: 'Welcome'}}
      />
      <Tab.Screen
        name="settings"
        component={SettingsPage}
        options={{tabBarLabel: 'Settings', headerTitle: 'Settings'}}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
