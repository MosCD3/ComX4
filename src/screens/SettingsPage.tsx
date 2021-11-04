import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SwitchCell} from '../components/common/SwitchCell';
import {useStorage} from '../wrappers/StorageProvider';
import {KEY_STORAGE_ISAUTOACCEPTCONN} from '../Constants';
import {useSettings} from '../wrappers/SettingsProvider';

const SettingsPage = props => {
  const [autoAcceptConn, setAutoAcceptConnVal] = useState(false);
  const {setValue, getValue} = useStorage();
  const {setSettings, getSettings} = useSettings();

  const setAutoAcceptConnections = (val: boolean) => {
    //Set value in storage
    let stringVal = val ? '1' : '0';
    setValue(KEY_STORAGE_ISAUTOACCEPTCONN, stringVal);

    //set value in settings
    let settings = getSettings();
    settings.agentAutoAcceptConnections = val;
    setSettings(settings);
  };

  useEffect(() => {
    //loading settings
    let settings = getSettings();
    setAutoAcceptConnVal(settings.agentAutoAcceptConnections);
  }, []);

  return (
    <View style={styles.container}>
      <SwitchCell
        isToggled={autoAcceptConn}
        onToggled={setAutoAcceptConnections}
        title="Auto accept connections"
      />
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
});

export default SettingsPage;
