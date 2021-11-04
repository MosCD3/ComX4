import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useState} from 'react';
import {StorageContextType} from '../models';

export const StorageContext = React.createContext<any>({});

export const useStorage = (): StorageContextType => {
  return useContext(StorageContext);
};

const StorageProvider = ({children}) => {
  const [app, setapp] = useState(false);

  const storeValue = async (key: string, value: string) => {
    try {
      console.log(`AsyncStorage: Save=> key:${key} value:${value}`);
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log(`Error[17] StorageProvide> storeValue: ${error.message}`);
    }
  };
  const getValue = async (key: string): Promise<string | null> => {
    try {
      let resturned = await AsyncStorage.getItem(key);
      console.log(`Got value:${resturned}`);
      console.log(`AsyncStorage: Get=> key:${key} value:${resturned}`);
      return resturned;
    } catch (error) {
      console.log(`Error[17] StorageProvide> getValue: ${error.message}`);
      return null;
    }
  };
  return (
    <StorageContext.Provider value={{setValue: storeValue, getValue: getValue}}>
      {children}
    </StorageContext.Provider>
  );
};

export default StorageProvider;
