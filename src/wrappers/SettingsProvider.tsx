import React, {useContext, useEffect, useState} from 'react';
import {KEY_STORAGE_ISAUTOACCEPTCONN} from '../Constants';
import {SettingsContextType} from '../models';
import AppSettings from '../models/AppSettings';
import {useStorage} from './StorageProvider';

export const SettingsContext = React.createContext<any>({});
export const useSettings = (): SettingsContextType => {
  return useContext(SettingsContext);
};

const SettingsProvider = ({children}) => {
  const {setValue, getValue} = useStorage();
  const [appSettings, setAppSettingsFunc] = useState(new AppSettings());

  useEffect(() => {
    console.log('Initializing app settings');
    getValue(KEY_STORAGE_ISAUTOACCEPTCONN).then(value => {
      let boolVal = value === '1';
      appSettings.agentAutoAcceptConnections = boolVal;
    });
  }, []);
  const setSettings = (val: AppSettings) => {
    setAppSettingsFunc(val);
  };

  const getSettings = (): AppSettings => appSettings;
  return (
    <SettingsContext.Provider
      value={{setSettings: setSettings, getSettings: getSettings}}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
