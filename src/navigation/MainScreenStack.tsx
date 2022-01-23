import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import StartUpPage from '../screens/StartUpPage';
import ConnectionsInvitePage from '../screens/ConnectionsInvitePage';
import ConnectionDetailsPage from '../screens/ConnectionDetailsPage';
import {ConnectionRecord} from '@aries-framework/core';

export type MainPageStackParams = {
  Main: undefined;
  'Connections Invite': undefined;
  'Connection Details': {connectionID: string};
};
const Stack = createNativeStackNavigator<MainPageStackParams>();

const MainScreenStack = () => {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen name="Main" component={StartUpPage} />
      <Stack.Screen
        name="Connections Invite"
        component={ConnectionsInvitePage}
      />
      <Stack.Screen
        name="Connection Details"
        component={ConnectionDetailsPage}
      />
    </Stack.Navigator>
  );
};

export default MainScreenStack;
