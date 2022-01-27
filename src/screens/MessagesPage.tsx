import {
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
  ConnectionRecord,
} from '@aries-framework/core';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import {Header} from '../components/common';
import Input from '../components/common/Input';
import {MainPageStackParams} from '../navigation/MainScreenStack';
import {useAgent} from '../wrappers/AgentProvider';

interface Props {
  navigation: StackNavigationProp<MainPageStackParams, 'Messages'>;
  route: RouteProp<MainPageStackParams, 'Messages'>;
}

const MessagesPage: React.FC<Props> = ({route, navigation}) => {
  var lastMessageRef = '';
  //Params
  const {connectionID} = route.params;

  //Hooks
  const {
    getAgent,
    getConnection,
    sendBasicMessage,
    subscribeToBasicMessages,
    unsubscribeToBasicMessages,
  } = useAgent();

  const [messages, setMessages] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [connection, setConnection] = useState<ConnectionRecord>();

  const initComponent = async () => {
    console.log(`trying to fetch connection with ID:${connectionID}`);
    if (!getConnection) {
      Alert.alert('getConnection hook undefined!');
    }
    let conn = await getConnection?.(connectionID);
    if (!conn) {
      Alert.alert('Cannot fetch connection from agent!');
      return;
    }
    setConnection(conn);

    // setMe({_id: 1, name: 'My Label'});
    // setMessages([
    //   {
    //     _id: 1,
    //     text: 'Hello developer',
    //     createdAt: new Date(),
    //     user: {
    //       _id: 2,
    //       name: 'React Native',
    //       avatar: 'https://placeimg.com/140/140/any',
    //     },
    //   },
    // ]);

    // subscribeToBasicMessages?.(connectionID, messageRecieved);

    getAgent.events.on<BasicMessageStateChangedEvent>(
      BasicMessageEventTypes.BasicMessageStateChanged,
      messageRecieved,
    );

    console.log('done init chat page');
  };

  const deInit = () => {
    console.log('Doing de init');
    getAgent.events.off<BasicMessageStateChangedEvent>(
      BasicMessageEventTypes.BasicMessageStateChanged,
      messageRecieved,
    );
  };

  useEffect(() => {
    console.log('starting chat');
    initComponent();
    return deInit;
  }, []);

  const messageRecieved = (event: BasicMessageStateChangedEvent) => {
    console.log(
      `A message from other side recieved:${event.payload.message.id}/Message:${event.payload.message.content}`,
    );
    if (lastMessageRef === event.payload.message.content) {
      return;
    }
  };

  function sendMessage() {
    console.log(`please send message:${lastMessage}`);
    lastMessageRef = lastMessage;
    sendBasicMessage?.(connectionID, lastMessage);
    setLastMessage('');
  }

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.headerWrapper}>
        <Header headerText={connection?.theirLabel} />
      </View>
      <View style={styles.messagesWrapper}>
        <Text>{messages}</Text>
      </View>
      <View style={styles.footerWrapper}>
        <Input
          label="Message"
          value={lastMessage}
          onChangeText={text => setLastMessage(text)}
          onEndEditing={sendMessage}
          placeholder="Enter message"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  headerWrapper: {
    height: 100,
  },
  messagesWrapper: {
    flex: 1,
  },
  footerWrapper: {
    height: 100,
  },
});
export default MessagesPage;
