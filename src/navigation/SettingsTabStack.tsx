import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import StartUpPage from '../screens/StartUpPage';
import ConnectionsInvitePage from '../screens/ConnectionsInvitePage';
import ConnectionDetailsPage from '../screens/ConnectionDetailsPage';
import {ConnectionRecord} from '@aries-framework/core';
import MessagesPage from '../screens/MessagesPage';
import SettingsScreen from '../screens/SettingsScreen';
import SettingsPage from '../screens/SettingsPage';

export type SettingsTabStackParams = {
  SettingsScreen: undefined;
};
const Stack = createNativeStackNavigator<SettingsTabStackParams>();

const SettingsScreenStack = () => {
  return (
    <Stack.Navigator initialRouteName="SettingsScreen">
      <Stack.Screen name="SettingsScreen" component={SettingsPage} />
    </Stack.Navigator>
  );
};

export default SettingsScreenStack;
