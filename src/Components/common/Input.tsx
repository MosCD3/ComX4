import React, {useEffect, useState} from 'react';
import {TextInput, View, Text, ViewStyle, StyleSheet} from 'react-native';

interface Props {
  label: string;
  value?: string;
  onChangeText?: (text: string | undefined) => void;
  onEndEditing?: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
}
const Input: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  onEndEditing,
  placeholder,
  secureTextEntry,
  style,
}) => {
  const {inputStyle, labelStyle, containerStyle} = styles;
  const [textValue, setFieldValue] = useState(value);

  useEffect(() => {
    onChangeText?.(textValue);
  }, [textValue]);

  return (
    <View style={[style, containerStyle]}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        autoCorrect={false}
        style={inputStyle}
        value={value}
        onChangeText={text => {
          setFieldValue(text);
        }}
        onEndEditing={() => {
          onEndEditing();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputStyle: {
    color: '#000',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 16,
    lineHeight: 23,
    flex: 2,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: 5,
    paddingEnd: 5,
    borderRadius: 10,
  },
  labelStyle: {
    fontSize: 16,
    paddingLeft: 0,
    flex: 1,
  },
  containerStyle: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default Input;
