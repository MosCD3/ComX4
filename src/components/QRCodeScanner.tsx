import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {RNCamera, BarCodeReadEvent} from 'react-native-camera';

const QRCodeScanner = ({onCodeRead}) => {
  return (
    <View>
      <Text>Qr code scanner</Text>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        onBarCodeRead={(event: BarCodeReadEvent) => {
          console.log('Scanned QR Code');
          console.log('BARCODE: ', event.data);
          onCodeRead(event.data);
        }}
      />
    </View>
  );
};

let CameraWidth = 0.82 * Dimensions.get('window').width;

const styles = StyleSheet.create({
  camera: {
    width: CameraWidth,
    height: CameraWidth,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#0A1C40',
    borderRadius: 3,
    alignItems: 'center',
    overflow: 'hidden',
    justifyContent: 'center',
  },
});

export default QRCodeScanner;
