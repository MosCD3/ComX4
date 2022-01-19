import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import StartUpPage from '../screens/StartUpPage';
import ConnectionsInvitePage from '../screens/ConnectionsInvitePage';

export type MainPageStackParams = {
  Main: undefined;
  'Connections Invite': undefined;
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
    </Stack.Navigator>
  );
};

export default MainScreenStack;
