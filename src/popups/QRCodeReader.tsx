import React, {useContext, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {Button} from '../components/common/Button';
import QRCodeScanner from '../components/QRCodeScanner';
import {ModalContext} from '../wrappers/AppWrapper';

interface Props {
  onRead: (arg0: string) => void;
}

const QRCodeReader = (props: Props) => {
  const {setModal} = useContext(ModalContext);
  const [isScanStarted, setIsScanStarted] = useState(false);

  const dismissModal = () => {
    setModal({
      isVisible: false,
      children: {},
    });
  };

  useEffect(() => {
    setIsScanStarted(true);
  }, []);

  return (
    <View>
      <QRCodeScanner
        onCodeRead={(code: string) => {
          if (isScanStarted) {
            console.log('got code:', code);
            setIsScanStarted(false);
            dismissModal();
            props.onRead(code);
          }
        }}
      />
      <Button
        onPress={() => {
          dismissModal();
        }}>
        <Text style={{marginTop: 5}}>Close</Text>
      </Button>
    </View>
  );
};

export default QRCodeReader;
