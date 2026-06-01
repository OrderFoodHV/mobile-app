import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, Text, View, Dimensions, FlatList, Alert, SectionList, ScrollView, RefreshControl } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import colors_global from '@assets/colors/global_colors';
import sizes from '@assets/styles/sizes';
import styles_c from '@assets/styles/styles_c';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import FirstProductRoute from './FirstProductRoute';
import SecondProductRoute from './SecondProductRoute';
import ThirdProductRoute from './ThirdProductRoute';
import FourthProductRoute from './FourthProductRoute';
import colors from '@assets/colors/global_colors';
import { Ionicons } from '@expo/vector-icons';

const TabBarCustom = ({ navigationState, jumpTo }: any) => {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.white,
      borderColor: colors_global.gray_medium,
      borderWidth:1,  
    }}>
      {navigationState.routes.map((route: any, index: number) => {
        const isActive = navigationState.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => jumpTo(route.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={route.icon}
              size={20}
              color={isActive ? colors_global.blue_primary : colors_global.gray_primary}
              style={{ marginBottom: 4 }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isActive ? colors_global.blue_primary : colors_global.gray_primary,
              }}
            >
              {route.title}
            </Text>
            {isActive && (
              <View
                style={{
                  marginTop: 6,
                  height: 2,
                  width: '100%',
                  backgroundColor: colors_global.blue_primary,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};



export interface ListProductTabBarProps {

}

const ListProductTabBar: React.FC<ListProductTabBarProps> = () => {


  const dispatch = useDispatch<AppDispatch>()
  const [refreshKey, setRefreshKey] = useState(0);
  const [index, setIndex] = useState(0);

  const handleReset = () => {
    setRefreshKey((prev) => prev + 1);
  };


  const renderScene = useMemo(() => SceneMap({
    first: () => <FirstProductRoute />,
    second: () => <SecondProductRoute />,
    third: () => <ThirdProductRoute />,
    fourth: () => <FourthProductRoute />,
  }), []);

  const routes = useMemo(() => [
    { key: 'first', title: 'Tất cả', icon: 'apps-outline' },
    { key: 'second', title: 'Đồ ăn nhanh', icon: 'fast-food-outline' },
    { key: 'third', title: 'Ăn vặt', icon: 'pizza-outline' },
    { key: 'fourth', title: 'Đồ uống', icon: 'cafe-outline' },
  ], []);

  return (
    <View style={{ height: sizes._screen_height }}>
      <TabView
        key={refreshKey}
        style={{ flex: 1, marginBottom: sizes._100sdp }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        lazy
        initialLayout={{ width: sizes._screen_width }}
        renderTabBar={(props) => <TabBarCustom {...props}  />}
      />
    </View>
  );
};

export default ListProductTabBar;
