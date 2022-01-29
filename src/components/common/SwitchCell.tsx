import React, {useEffect, useState} from 'react';
import {Text, Switch, TouchableOpacity, View, StyleSheet} from 'react-native';

interface Props {
  title: string;
  isToggled?: boolean;
  onToggled: (arg0: boolean) => void;
}
const SwitchCell = (props: Props) => {
  const {title, isToggled, onToggled} = props;
  const [isEnabled, setIsEnabled] = useState(isToggled);
  const {buttonStyle, textStyle} = styles;

  const toggleSwitch = () =>
    setIsEnabled(previousState => {
      let newVal = !previousState;
      onToggled(newVal);
      return newVal;
    });

  useEffect(() => {
    console.log(`is toggled value changed:${isToggled}`);
    setIsEnabled(isToggled);
  }, [isToggled]);

  return (
    <View style={styles.container}>
      <Text style={styles.textStyle}>{title}</Text>
      <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  textStyle: {
    textAlignVertical: 'center',
    fontSize: 16,
  },
});

export {SwitchCell};
