import React, {useContext, useEffect, useState} from 'react';
import {
  KEY_STORAGE_ISAUTOACCEPTCONN,
  KEY_STORAGE_WALLETID,
  KEY_STORAGE_WALLETKEY,
  KEY_STORAGE_WALLETLABEL,
  KEY_STORAGE_WALLET_RANDOMKEYS,
} from '../Constants';
import {SettingsContextType} from '../models';
import AppSettings from '../models/AppSettings';
import {useStorage} from './StorageProvider';
import DeviceInfo from 'react-native-device-info';

export const SettingsContext = React.createContext<any>({});
export const useSettings = (): SettingsContextType => {
  return useContext(SettingsContext);
};

const SettingsProvider = ({children}) => {
  const {setValue, getValue} = useStorage();
  const [appSettings, setAppSettingsFunc] = useState(new AppSettings());

  useEffect(() => {
    console.log('Initializing app settings');

    //load config
    getValue(KEY_STORAGE_ISAUTOACCEPTCONN).then(value => {
      let boolVal = value === '1';
      appSettings.agentAutoAcceptConnections = boolVal;
    });

    //load wallet label
    getValue(KEY_STORAGE_WALLETLABEL)
      .then(value => {
        if (value) {
          appSettings.walletLabel = value;
          console.log(`Wallet label loaded:${appSettings.walletLabel}`);
        } else {
          var timeNow = new Date();
          appSettings.walletLabel = `ComX_${timeNow.getTime()}`;
          console.log(
            `Wallet label not set, setting default name:${appSettings.walletLabel}`,
          );
        }
      })
      .catch(error => {
        console.log(`Error[38] loading wallet label:${error}`);
      });

    //Randomise wallet keys
    getValue(KEY_STORAGE_WALLET_RANDOMKEYS).then(value => {
      let boolVal = value === '1';
      appSettings.walletRotateKeys = boolVal;
    });

    //load wallet ID
    getValue(KEY_STORAGE_WALLETID)
      .then(value => {
        if (value) {
          appSettings.walletID = value;
          console.log(`Wallet id loaded:${appSettings.walletID}`);
        } else {
          var timeNow = new Date();
          //TODO: create strong ID
          appSettings.walletID = `ComXwid_${timeNow.getTime()}`;
          console.log(
            `Wallet id not set, setting new id:${appSettings.walletID}`,
          );
        }
      })
      .catch(error => {
        console.log(`Error[74] loading wallet id:${error}`);
      });

    //load wallet Key
    getValue(KEY_STORAGE_WALLETKEY)
      .then(value => {
        if (value) {
          appSettings.walletKey = value;
          console.log(`Wallet key loaded:${appSettings.walletKey}`);
        } else {
          //TODO: create strong Password
          appSettings.walletKey = `123`;
          console.log(
            `Wallet key not set, setting new key:${appSettings.walletKey}`,
          );
        }
      })
      .catch(error => {
        console.log(`Error[94] loading wallet key:${error}`);
      });
  }, []);

  const setSettings = (val: AppSettings) => {
    setAppSettingsFunc(val);
  };

  const getSettings = (): AppSettings => appSettings;
  return (
    <SettingsContext.Provider
      value={{
        setSettings: setSettings,
        getSettings: getSettings,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
