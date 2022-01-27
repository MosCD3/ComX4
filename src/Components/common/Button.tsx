import React from 'react';
import {Text, TouchableOpacity, ViewStyle} from 'react-native';
interface Props {
  onPress: () => void;
  style?: ViewStyle;
  children?: Element;
  noMargin?: boolean | false;
}

const Button = (props: Props) => {
  const {onPress, children, style} = props;
  const {buttonStyle, textStyle, buttonPadding} = styles;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={
        props.noMargin
          ? [style, buttonStyle]
          : [style, buttonStyle, buttonPadding]
      }>
      <Text style={styles.textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = {
  textStyle: {
    alignSelf: 'center',
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600',
    paddingTop: 10,
    paddingBottom: 10,
  },
  buttonStyle: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007aff',
  },
  buttonPadding: {
    marginTop: 10,
    marginBottom: 10,
  },
};

export {Button};
