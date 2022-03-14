import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {SwitchCell} from '../components/common/SwitchCell';
import {useStorage} from '../wrappers/StorageProvider';
import {
  KEY_STORAGE_ISAUTOACCEPTCONN,
  KEY_STORAGE_WALLETID,
  KEY_STORAGE_WALLETKEY,
  KEY_STORAGE_WALLETLABEL,
  KEY_STORAGE_WALLET_RANDOMKEYS,
} from '../Constants';
import {useSettings} from '../wrappers/SettingsProvider';
import {Button, Card, Input} from '../components/common';

const SettingsPage: React.FC = () => {
  //Hooks
  const {setValue, getValue} = useStorage();
  const {setSettings, getSettings} = useSettings();

  //State
  const [autoAcceptConn, setAutoAcceptConnVal] = useState(false);
  const [walletLabel, setWalletLabel] = useState('');
  const [walletID, setWalletID] = useState('');
  const [walletKey, setWalletKey] = useState('');
  const [autoRotateKeys, setAutoRotateKeys] = useState(false);
  const [advancedViewVisible, setAdvancedViewVisible] = useState(false);

  useEffect(() => {
    //loading settings
    let settings = getSettings();
    setAutoAcceptConnVal(settings.agentAutoAcceptConnections);
    setWalletLabel(settings.walletLabel);
    setWalletID(settings.walletID);
    setWalletKey(settings.walletKey);
    setAutoRotateKeys(settings.walletRotateKeys);
  }, []);

  const setAutoAcceptConnections = (val: boolean) => {
    if (val == null) {
      //set value in settings
      let settings = getSettings();
      settings.agentAutoAcceptConnections = true;
      setSettings(settings);
      return;
    }
    //Set value in storage
    let stringVal = val ? '1' : '0';
    setValue(KEY_STORAGE_ISAUTOACCEPTCONN, stringVal);

    //set value in settings
    let settings = getSettings();
    settings.agentAutoAcceptConnections = val;
    setSettings(settings);
  };

  const setAutoRotateKeysFunc = (val: boolean) => {
    //Set value in storage
    let stringVal = val ? '1' : '0';
    setValue(KEY_STORAGE_WALLET_RANDOMKEYS, stringVal);

    //set value in settings
    let settings = getSettings();
    settings.walletRotateKeys = val;
    setSettings(settings);
  };

  function saveWalletLabel() {
    if (!(walletLabel && walletLabel.trim())) {
      Alert.alert('Please enter valid wallet label');
      return;
    }

    //Save to storage
    setValue(KEY_STORAGE_WALLETLABEL, walletLabel);

    //update settings
    let settings = getSettings();
    settings.walletLabel = walletLabel;
    setSettings(settings);
  }

  function saveWalletID() {
    if (!(walletID && walletID.trim())) {
      Alert.alert('Please enter valid wallet id');
      return;
    }

    //Save to storage
    setValue(KEY_STORAGE_WALLETID, walletID);

    //update settings
    let settings = getSettings();
    settings.walletID = walletID;
    setSettings(settings);
  }

  function saveWalletKey() {
    if (!(walletKey && walletKey.trim())) {
      Alert.alert('Please enter valid wallet key');
      return;
    }

    //Save to storage
    setValue(KEY_STORAGE_WALLETKEY, walletKey);

    //update settings
    let settings = getSettings();
    settings.walletKey = walletKey;
    setSettings(settings);
  }

  function reKey(newKey) {}

  return (
    <View style={styles.container}>
      <Input
        label="Wallet Label"
        value={walletLabel}
        onChangeText={text => setWalletLabel(text)}
        onEndEditing={saveWalletLabel}
        placeholder="Enter label"
        style={styles.inputFieldStyle}
      />
      <SwitchCell
        isToggled={autoAcceptConn}
        onToggled={setAutoAcceptConnections}
        title="Auto accept connections"
      />
      <Button
        onPress={() => {
          setAdvancedViewVisible(!advancedViewVisible);
        }}>
        <Text>Advanced</Text>
      </Button>
      {advancedViewVisible ? (
        <Card>
          <Input
            label="Wallet ID"
            value={walletID}
            onChangeText={text => setWalletID(text)}
            onEndEditing={saveWalletID}
            placeholder="Enter ID"
            style={styles.inputFieldStyle}
          />
          <Input
            label="Wallet Key"
            value={walletKey}
            onChangeText={text => setWalletKey(text)}
            onEndEditing={saveWalletKey}
            placeholder="Enter password"
            style={styles.inputFieldStyle}
          />
          <View style={styles.spacer} />
          <Text style={styles.captionTextStyle}>
            Enabled?: Create new wallet on each app run
          </Text>
          <SwitchCell
            isToggled={autoRotateKeys}
            onToggled={setAutoRotateKeysFunc}
            title="Randomise keys"
          />
        </Card>
      ) : (
        <View />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  buttonStyle: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007aff',
    marginLeft: 5,
    marginRight: 5,
  },
  inputFieldStyle: {},
  spacer: {
    paddingTop: 20,
  },
  captionTextStyle: {
    color: '#727272',
  },
});

export default SettingsPage;
