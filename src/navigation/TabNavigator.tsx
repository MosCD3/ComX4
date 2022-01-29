import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import StartUpPage from '../screens/StartUpPage';
import SettingsPage from '../screens/SettingsPage';
import Icon from 'react-native-vector-icons/AntDesign';
import MainScreenStack from './MainScreenStack';
import SettingsScreen from '../screens/SettingsScreen';
import SettingsScreenStack from './SettingsTabStack';

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="main"
        component={MainScreenStack}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'Welcome',
          tabBarIcon: ({color, size}) => {
            return <Icon name="home" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsScreenStack}
        options={{
          tabBarLabel: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({color, size}) => {
            return <Icon name="setting" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
