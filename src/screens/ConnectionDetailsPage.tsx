import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {MainPageStackParams} from '../navigation/MainScreenStack';
import {ConnectionRecord} from '@aries-framework/core';
import {useAgent} from '../wrappers/AgentProvider';
import {Button, Card, CardSection, Header} from '../components/common';
import LabledValue from '../components/common/LabeledValue';

interface Props {
  navigation: StackNavigationProp<MainPageStackParams, 'Connection Details'>;
  route: RouteProp<MainPageStackParams, 'Connection Details'>;
}
const ConnectionDetailsPage: React.FC<Props> = ({route, navigation}) => {
  const {connectionID} = route.params;

  const {
    startAgent,
    processInvitationUrl,
    processMessage,
    getConnection,
    deleteConnection,
  } = useAgent();

  const [connection, setConnection] = useState<ConnectionRecord>();

  const initComponent = async () => {
    let conn = await getConnection?.(connectionID);
    if (!conn) {
      Alert.alert('Cannot fetch connection from agent!');
      return;
    }
    setConnection(conn);
  };

  const deleteCurrentConnection = async () => {
    if (!deleteConnection) {
      Alert.alert('Cannot find hook deleteConnection!');
      return;
    }
    const deleted = await deleteConnection(connectionID);
    if (deleted) {
      navigation.goBack();
    }
  };

  useEffect(() => {
    initComponent();
  }, []);

  return (
    <View style={styles.wrapper}>
      <Header headerText={connection?.theirLabel} />
      <Card>
        <CardSection>
          <Text>Details</Text>
        </CardSection>
        <LabledValue label="ID" value={connection?.id} />
        <LabledValue
          label="Created at"
          value={connection?.createdAt.toString()}
        />
        <LabledValue label="State" value={connection?.state} />
      </Card>
      <Button
        onPress={
          () => navigation.navigate('Messages', {connectionID: connectionID})
          // navigation.navigate('Chat', {connectionID: connectionID})
        }>
        <Text>Message</Text>
      </Button>
      <Button
        onPress={() => {
          Alert.alert('Attention!', 'Delete connection?', [
            {
              text: 'Delete',
              onPress: () => {
                deleteCurrentConnection();
              },
            },
            {
              text: 'Cancel',
              onPress: () => {},
            },
          ]);
        }}>
        <Text>Delete</Text>
      </Button>
    </View>
  );
};

export const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
  },
});
export default ConnectionDetailsPage;
