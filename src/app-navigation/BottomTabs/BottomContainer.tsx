import React, { memo } from 'react';
import BottomTabs from './navigation-bottom-tabs';
import colors from '@assets/colors/global_colors';
import { View } from 'react-native';

const BottomContainer = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  return (
    <View style={{ flex: 1 }} >
      <BottomTabs navigation={navigation} route={route} />
    </View>
  );
};

export default memo(BottomContainer);
