import {
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
  ConnectionRecord,
} from '@aries-framework/core';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Text, Alert, TextInput, FlatList} from 'react-native';
import {Header, Input} from '../components/common';
import {MainPageStackParams} from '../navigation/MainScreenStack';
import {useAgent} from '../wrappers/AgentProvider';

interface IMessage {
  id: string | number;
  text: string;
  createdAt: Date | number;
  userId: string;
  userTitle?: string | undefined;
  image?: string;
  isMe: boolean;
}

interface Props {
  navigation: StackNavigationProp<MainPageStackParams, 'Messages'>;
  route: RouteProp<MainPageStackParams, 'Messages'>;
}

class FakeMessage {
  public static MyMessage = '';
}
//Chat item component
const MessageListItem = (message: IMessage) => {
  const _styles = StyleSheet.create({
    wrapper: {
      padding: 10,
      backgroundColor: message.isMe ? 'transparent' : '#fff',
      marginBottom: 15,
    },
    messageStyle: {
      textAlign: message.isMe ? 'right' : 'left',
    },
    dateWrapper: {},
    dateText: {},
  });

  return (
    <View style={_styles.wrapper}>
      <Text style={_styles.messageStyle}>{message.text}</Text>
    </View>
  );
};

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

  // const [messages, setMessages] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);
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

    getAgent.events.on<BasicMessageStateChangedEvent>(
      BasicMessageEventTypes.BasicMessageStateChanged,
      (event: BasicMessageStateChangedEvent) => {
        messageRecieved(lastMessageRef, event);
      },
    );

    console.log('done init chat page');
  };

  const deInit = () => {
    console.log('Doing de init');
    getAgent.events.off<BasicMessageStateChangedEvent>(
      BasicMessageEventTypes.BasicMessageStateChanged,
      (event: BasicMessageStateChangedEvent) => {
        messageRecieved(lastMessage, event);
      },
    );
  };

  useEffect(() => {
    console.log('starting chat');
    initComponent();
    return deInit;
  }, []);

  const messageRecieved = (
    myMessage: string,
    event: BasicMessageStateChangedEvent,
  ) => {
    const isMe = FakeMessage.MyMessage === event.payload.message.content;
    //add message to quee
    setMessages(previousMessages => {
      return [
        ...previousMessages,
        {
          id: event.payload.message.id,
          text: event.payload.message.content,
          createdAt: event.payload.message.sentTime,
          userId: event.payload.basicMessageRecord.connectionId,
          userTitle: !isMe ? connection?.theirLabel : undefined,
          isMe: isMe,
        },
      ];
    });
  };

  function sendMessage() {
    console.log(`please send message:${lastMessage}`);
    lastMessageRef = lastMessage;
    FakeMessage.MyMessage = lastMessage;
    sendBasicMessage?.(connectionID, lastMessage);
    setLastMessage('');
  }

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.headerWrapper}>
        <Header headerText={connection?.theirLabel} />
        <View>
          <Input
            value={lastMessage}
            onChangeText={text => setLastMessage(text)}
            placeholder="Enter message"
            labelButtonRight="Send"
            onLeftButtonClick={sendMessage}
          />
        </View>
      </View>
      <View style={styles.messagesWrapper}>
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={element => MessageListItem(element.item)}
        />
      </View>
      <View style={styles.footerWrapper}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    padding: 20,
  },
  headerWrapper: {},
  messagesWrapper: {
    flex: 1,
  },
  footerWrapper: {
    height: 100,
  },
});
export default MessagesPage;
