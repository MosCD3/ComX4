import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Button} from '../components/common/Button';
import QRCodeScanner from '../components/QRCodeScanner';
import {ModalContext} from '../wrappers/AppWrapper';

interface Props {
  onRead: (arg0: string) => void;
}

const InputTextArea = (props: Props) => {
  const {setModal} = useContext(ModalContext);
  const [isScanStarted, setIsScanStarted] = useState(false);
  const [inputText, setInputText] = useState('');

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
    <TouchableWithoutFeedback
      style={styles.wrapper}
      onPress={Keyboard.dismiss}
      accessible={false}>
      <View>
        <Button onPress={Keyboard.dismiss}>Dismiss Keyboard</Button>
        <TextInput
          // Inherit any props passed to it; e.g., multiline, numberOfLines below
          multiline={true}
          onChangeText={text => {
            setInputText(text);
          }}
          value={inputText}
          editable={true}
          style={styles.inputTextStyle}
        />
        <Button
          onPress={() => {
            dismissModal();
            props.onRead(inputText);
          }}>
          <Text style={{marginTop: 5}}>Submit</Text>
        </Button>
        <Button
          onPress={() => {
            dismissModal();
          }}>
          <Text style={{marginTop: 5}}>Close</Text>
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
  },
  inputTextStyle: {
    width: 300,
    height: 200,
  },
});

export default InputTextArea;
