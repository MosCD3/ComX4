import React, {useContext, useState} from 'react';
import {ModalContext} from '../wrappers/AppWrapper';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import QRCodeReader from '../popups/QRCodeReader';
import {AgentContext, getAgent, useAgent} from '../wrappers/AgentProvider';
import GenericList from '../components/list/GenericList';
import {ListItemType} from '../models';
import {CredentialRecord} from '@aries-framework/core';
import {parseSchema} from '../Helpers';
import InputTextArea from '../popups/InputTextArea';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {MainPageStackParams} from '../navigation/MainScreenStack';

interface Props {
  navigation: StackNavigationProp<MainPageStackParams, 'Main'>;
  route: RouteProp<MainPageStackParams, 'Main'>;
}

const StartUpPage: React.FC<Props> = ({navigation, route}) => {
  const {setModal} = useContext(ModalContext);
  const {startAgent, processInvitationUrl, processMessage} = useAgent();
  const {agent} = getAgent();

  const dismissModal = () => {
    setModal({
      isVisible: false,
      children: {},
    });
  };

  const qrCodeView = () => {
    return (
      <QRCodeReader
        onRead={code => {
          if (code) {
            processInvitationUrl(code);
          }
        }}
      />
    );
  };

  const inputTextView = () => {
    return (
      <InputTextArea
        onRead={message => {
          if (message) {
            processMessage(message);
          }
        }}
      />
    );
  };

  const showAllConnections = async () => {
    if (agent) {
      let connections = await agent.connections?.getAll();
      if (connections) {
        // let list: ListItemType[] = connections.map(c => {id: "", title:''});
        const newdata: ListItemType[] = connections.map(x => {
          let _lable = x.theirLabel ? x.theirLabel : '--';
          return {id: x.id, title: _lable};
        });

        console.log(`>> Connections OBJECT DUMP>>: ${JSON.stringify(newdata)}`);
        setModal({
          isVisible: true,
          children: (
            <GenericList
              items={newdata}
              buttonTitle="Invite"
              buttonCallback={() => {
                dismissModal();
                navigation.push('Connections Invite');
              }}
            />
          ),
        });
      }
    } else {
      Alert.alert('still cannot find aagent');
    }
  };

  const showAllCredentails = async () => {
    if (agent) {
      let credentials: CredentialRecord[] = await agent.credentials?.getAll();
      if (credentials) {
        // let list: ListItemType[] = connections.map(c => {id: "", title:''});
        const newdata: ListItemType[] = credentials.map(x => {
          return {id: x.id, title: parseSchema(x.metadata.schemaId)};
        });

        console.log(`>> Credential OBJECT DUMP>>: ${JSON.stringify(newdata)}`);
        setModal({
          isVisible: true,
          children: <GenericList items={newdata} />,
        });
      }
    } else {
      Alert.alert('still cannot find aagent');
    }
  };

  return (
    <View style={{flex: 1}}>
      <Text>This is agent provider</Text>
      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={async () => {
          var error = await startAgent();
          if (error) {
            Alert.alert('Error', error);
          } else {
            Alert.alert('Agent Init. Success!');
          }
        }}>
        <Text style={styles.textStyle}>Init Agent</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={() => {
          setModal({
            isVisible: true,
            children: qrCodeView(),
          });
        }}>
        <Text style={styles.textStyle}>Scan QrCode</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={() => {
          showAllConnections();
        }}>
        <Text style={styles.textStyle}>Connections</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={() => {
          showAllCredentails();
        }}>
        <Text style={styles.textStyle}>Credentials</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={() => {
          setModal({
            isVisible: true,
            children: inputTextView(),
          });
        }}>
        <Text style={styles.textStyle}>Process Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonStyles: {
    backgroundColor: '#565656',
    flex: 1,
    padding: 20,
    marginTop: 5,
  },
  textStyle: {
    color: '#fff',
    fontSize: 18,
  },
  qrCodeWrapper: {
    alignContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});

export default StartUpPage;
