import {
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
  ConnectionRecord,
} from '@aries-framework/core';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import {MainPageStackParams} from '../navigation/MainScreenStack';
import {useAgent} from '../wrappers/AgentProvider';
import {GiftedChat} from 'react-native-gifted-chat';

interface Reply {
  title: string;
  value: string;
  messageId?: any;
}

interface QuickReplies {
  type: 'radio' | 'checkbox';
  values: Reply[];
  keepIt?: boolean;
}
interface User {
  _id: string | number;
  name: string;
  avatar: string;
}

interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: User;
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
  quickReplies?: QuickReplies;
}

interface Props {
  navigation: StackNavigationProp<MainPageStackParams, 'Chat'>;
  route: RouteProp<MainPageStackParams, 'Chat'>;
}

const ChatPage: React.FC<Props> = ({route, navigation}) => {
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

  //State
  const [connection, setConnection] = useState<ConnectionRecord>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  //   const [me, setMe] = useState<User>();

  useEffect(() => {
    console.log('starting chat');

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
      console.log(`Connection successfully set!`);

      getAgent.events.on<BasicMessageStateChangedEvent>(
        BasicMessageEventTypes.BasicMessageStateChanged,
        messageRecieved,
      );

      console.log('done init chat page');
    };

    initComponent();

    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);

    return () => {
      console.log('Doing de init');
      if (!getAgent) {
        return;
      }
      if (!messageRecieved) {
        return;
      }
      getAgent.events.off<BasicMessageStateChangedEvent>(
        BasicMessageEventTypes.BasicMessageStateChanged,
        messageRecieved,
      );
    };
  }, []);

  const messageRecieved = (event: BasicMessageStateChangedEvent) => {
    console.log(
      `A message from other side recieved:${event.payload.message.id}/Message:${event.payload.message.content}`,
    );

    if (lastMessageRef === event.payload.message.content) {
      return;
    }

    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [
        {
          _id: event.payload.message.id,
          text: event.payload.message.content,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Other User',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ]),
    );
  };
  /*
  const messageRecievedDD = (id: string, message: string) => {
    console.log(`A message from other side recieved:${id}/Message:${message}`);
    if (!id) {
      return;
    }
    if (!message) {
      return;
    }
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [
        {
          _id: id,
          text: message,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ]),
    );
  };
*/
  const onSend = useCallback((_messages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, _messages),
    );
    let _lastMessage = _messages[_messages.length - 1];
    if (_lastMessage) {
      sendBasicMessage?.(connectionID, _lastMessage.text);
      lastMessageRef = _lastMessage.text;
    }
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{_id: 1, name: 'Moos1'}}
    />
  );
};

export default ChatPage;
