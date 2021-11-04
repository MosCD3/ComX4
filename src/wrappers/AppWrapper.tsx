import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View, Alert} from 'react-native';
import TabNavigator from '../navigation/TabNavigator';
import {ModalContextType} from '../models';
import AgentProvider from './AgentProvider';
import ModalContainer from '../popups/ModalContainer';
import StorageProvider from './StorageProvider';
import SettingsProvider from './SettingsProvider';

export const ModalContext = React.createContext<ModalContextType>({
  setModal: props => console.warn('No modal hook provided'),
});
const AppWrapper = () => {
  const [modalProps, setModalProps] = useState({
    children: {},
    isVisible: false,
  });

  return (
    <ModalContext.Provider
      value={{
        setModal: props => {
          setModalProps(props);
        },
      }}>
      <NavigationContainer>
        <ModalContainer modalProps={modalProps} />
        <StorageProvider>
          <SettingsProvider>
            <AgentProvider>
              <TabNavigator />
            </AgentProvider>
          </SettingsProvider>
        </StorageProvider>
      </NavigationContainer>
    </ModalContext.Provider>
  );
};

export default AppWrapper;
