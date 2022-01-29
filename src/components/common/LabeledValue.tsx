import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

interface Props {
  label: string;
  value: string;
}

const LabledValue = (props: Props) => {
  return (
    <View style={styles.labeledListItem}>
      <Text style={styles.labeledListItemLabel}>{props.label}</Text>
      <Text style={styles.labeledListItemValue}>{props.value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  labeledListItem: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#D5D5D5',
    paddingBottom: 10,
  },
  labeledListItemLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  labeledListItemValue: {
    color: '#393939',
  },
});
export default LabledValue;
