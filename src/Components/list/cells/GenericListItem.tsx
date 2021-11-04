import React, {useEffect, useState} from 'react';
import {
  FlatList,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CardSection} from '../../common/CardSection';

interface Props {
  item: ListItemType;
}

const GenericListItem = (props: Props) => {
  const {id, title} = props.item;
  const [isDetailsVisible, setDetailsVisible] = useState(false);

  // useEffect(() => {
  //   setDetailsVisible(selectedLibraryId === id);
  // }, [selectedLibraryId]);

  useEffect(() => {
    LayoutAnimation.spring();
  });

  return (
    <TouchableWithoutFeedback onPress={() => setDetailsVisible(true)}>
      <View>
        <CardSection>
          <View style={styles.cardWrapper}>
            <Text style={styles.titleStyle}>{title}</Text>
            {/* {expanded ? (
              <View style={styles.descStyle}>
                <Text>{description}</Text>
              </View>
            ) : null} */}
          </View>
        </CardSection>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 10,
  },
  titleStyle: {
    fontSize: 18,
    paddingLeft: 15,
  },
  descStyle: {
    padding: 15,
  },
});

export default GenericListItem;
