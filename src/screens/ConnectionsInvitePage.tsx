import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainPageStackParams} from '../navigation/MainScreenStack';
import {RouteProp} from '@react-navigation/native';
import {useAgent} from '../wrappers/AgentProvider';

interface Props {
  navigation: StackNavigationProp<MainPageStackParams, 'Connections Invite'>;
  route: RouteProp<MainPageStackParams, 'Connections Invite'>;
}
const ConnectionsInvitePage: React.FC<Props> = ({route, navigation}) => {
  const {createConnection} = useAgent();

  const createConnectionInvite = async () => {
    if (createConnection) {
      const inviteUrl = await createConnection();
      Alert.alert(inviteUrl);
    } else {
      Alert.alert('Error[20] Create connection undefined!');
    }
  };

  useEffect(() => {
    createConnectionInvite();
  }, []);
  return (
    <View>
      <Text>Am connections invite</Text>
    </View>
  );
};

export default ConnectionsInvitePage;
