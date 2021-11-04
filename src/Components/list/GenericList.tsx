import React, {useContext} from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import {ListItemType} from '../../models';
import {ModalContext} from '../../wrappers/AppWrapper';
import {Button} from '../common';
import GenericListItem from './cells/GenericListItem';

interface Props {
  items: ListItemType[];
}
const GenericList = (props: Props) => {
  const {items} = props;
  const {setModal} = useContext(ModalContext);
  const renderItem = element => {
    return <GenericListItem item={element.item} />;
  };
  return (
    <View style={styles.wrapper}>
      <FlatList
        style={{flexGrow: 0}}
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
      <Button
        onPress={() => {
          setModal({isVisible: false, children: null});
        }}>
        <Text>Close</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minWidth: Dimensions.get('window').width - 80,
  },
});

//this will get the state, pass it to 'mapStateToProps' take the return and pass it to LibraryList component as 'props' object
export default GenericList;
