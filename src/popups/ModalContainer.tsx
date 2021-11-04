import React, {useContext, useState} from 'react';
import {Alert, Modal, StyleSheet, View} from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
import {ModalProps} from '../models';
import {ModalContext} from '../wrappers/AppWrapper';

interface Props {
  modalProps: ModalProps;
}
const ModalContainer = (props: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {setModal} = useContext(ModalContext);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.modalProps.isVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* <View style={styles.topControlsWrapper}>
            <View style={styles.topControlsViewStyle}></View>
            <Icon
              name="close"
              size={20}
              color="#900"
              style={styles.closeIconStyle}
              onPress={() => {
                setModal({
                  isVisible: false,
                  children: {},
                });
              }}
            />
          </View> */}
          {props.modalProps.children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  topControlsWrapper: {
    flexDirection: 'row',
  },
  topControlsViewStyle: {
    flexGrow: 1,
  },
  closeIconStyle: {},
});

export default ModalContainer;
