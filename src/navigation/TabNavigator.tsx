import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import StartUpPage from '../screens/StartUpPage';
import SettingsPage from '../screens/SettingsPage';
import Icon from 'react-native-vector-icons/AntDesign';

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="main"
        component={StartUpPage}
        options={{
          tabBarLabel: 'Main',
          headerTitle: 'Welcome',
          tabBarIcon: ({color, size}) => {
            return <Icon name="home" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsPage}
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
