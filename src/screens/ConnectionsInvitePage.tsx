import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert, TextInput} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainPageStackParams} from '../navigation/MainScreenStack';
import {RouteProp} from '@react-navigation/native';
import {useAgent} from '../wrappers/AgentProvider';
import QRCode from 'react-native-qrcode-svg';
import {Button, Card} from '../components/common';
import {ConnectionRecord} from '@aries-framework/core';

interface Props {
  navigation: StackNavigationProp<MainPageStackParams, 'Connection Invite'>;
  route: RouteProp<MainPageStackParams, 'Connections Invite'>;
}
const ConnectionsInvitePage: React.FC<Props> = ({route, navigation}) => {
  const {createConnection, deleteConnection} = useAgent();
  const [inviteUrl, setInviteUrl] = useState('--');
  const [newConnection, setNewConnection] = useState<ConnectionRecord>();

  const createConnectionInvite = async () => {
    if (createConnection) {
      const _connection = await createConnection();
      if (!_connection) {
        Alert.alert('Error[23] Cannot create connection!!');
        return;
      }
      console.log(`==>Connection Record:${JSON.stringify(_connection)}`);
      setInviteUrl(_connection.invitationUrl);
      setNewConnection(_connection.connection);
    } else {
      Alert.alert('Error[20] Create connection undefined!');
    }
  };

  const testQRCode = () => {
    let invite =
      'http://mediator3.test.indiciotech.io:3000?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiYjE5YTM2ZjctZjhiZi00Mjg2LTg4ZjktODM4ZTIyZDI0ZjQxIiwgInJlY2lwaWVudEtleXMiOiBbIkU5VlhKY1pzaGlYcXFMRXd6R3RtUEpCUnBtMjl4dmJMYVpuWktTU0ZOdkE2Il0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL21lZGlhdG9yMy50ZXN0LmluZGljaW90ZWNoLmlvOjMwMDAiLCAibGFiZWwiOiAiSW5kaWNpbyBQdWJsaWMgTWVkaWF0b3IifQ==';
    setInviteUrl(invite);
  };

  const cancelConnection = async () => {
    if (!newConnection) {
      Alert.alert('No connection to cancel!');
      return;
    }

    if (!deleteConnection) {
      Alert.alert('Cannot find hook deleteConnection!');
      return;
    }

    const deleted = await deleteConnection(newConnection);
    if (deleted) {
      navigation.goBack();
    }
  };

  useEffect(() => {
    createConnectionInvite();
    // testQRCode();
  }, []);
  return (
    <View style={styles.mainWrapper}>
      <Text>Scan QR Code</Text>

      <Card style={styles.qrCodeWrapper}>
        <QRCode value={inviteUrl} size={200} />
      </Card>

      <Text>Or copy/past url</Text>
      <TextInput
        // Inherit any props passed to it; e.g., multiline, numberOfLines below
        multiline={true}
        value={inviteUrl}
        editable={false}
        style={styles.inputTextStyle}
      />

      <View style={styles.bottomControls}>
        <Button
          onPress={() => {
            Alert.alert('Attention!', 'Delete connection?', [
              {
                text: 'Delete',
                onPress: () => {
                  cancelConnection();
                },
              },
              {
                text: 'Cancel',
                onPress: () => {},
              },
            ]);
          }}>
          <Text>Cancel</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    padding: 40,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    padding: 20,
  },
  qrCodeView: {},
  inputTextStyle: {
    height: 200,
  },
  bottomControls: {
    marginTop: 10,
  },
});
export default ConnectionsInvitePage;
