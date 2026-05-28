import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, Image } from 'react-native';
import { TabView } from 'react-native-tab-view';
import colors_global from '@assets/colors/global_colors';
import sizes from '@assets/styles/sizes';
import colors from '@assets/colors/global_colors';
import { Ionicons } from '@expo/vector-icons';
import useCallAPI from '@app-helper/useCallAPI';
import URL_API from '@app-helper/urlAPI';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import { getProductData } from '@redux/features/productListSlice';
import ProductRoute from './ProductRoute';

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('ăn vặt') || n.includes('snack')) return 'pizza-outline';
  if (n.includes('nhanh') || n.includes('fast')) return 'fast-food-outline';
  if (n.includes('uống') || n.includes('drink') || n.includes('nước') || n.includes('cafe')) return 'cafe-outline';
  if (n.includes('cơm') || n.includes('rice')) return 'restaurant-outline';
  return 'fast-food-outline';
};

const TabBarCustom = ({ navigationState, jumpTo }: any) => {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.white,
      borderColor: colors_global.gray_medium,
      borderWidth: 1,
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
              paddingVertical: 12,
            }}
          >
            {route.image ? (
              <Image
                source={{ uri: route.image }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  marginBottom: 6,
                  opacity: isActive ? 1 : 0.6,
                }}
              />
            ) : (
              <Ionicons
                name={route.icon}
                size={26}
                color={isActive ? colors_global.blue_primary : colors_global.gray_primary}
                style={{ marginBottom: 6 }}
              />
            )}
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isActive ? colors_global.blue_primary : colors_global.gray_primary,
              }}
              numberOfLines={1}
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
                  position: 'absolute',
                  bottom: 0,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export interface ListProductTabBarProps {}

const ListProductTabBar: React.FC<ListProductTabBarProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasFetchedPaginationProductTypeAll } = useSelector((state: RootState) => state.productList, shallowEqual);

  const [refreshKey, setRefreshKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFetchedPaginationProductTypeAll) {
      dispatch(getProductData({ page: 1, limit: 1000, type: 'all' }));
    }
  }, [hasFetchedPaginationProductTypeAll]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await useCallAPI({
          method: 'GET',
          url: `${URL_API}/products/categories`,
        });
        if (response && response.status === 'success' && Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (Array.isArray(response)) {
          setCategories(response);
        }
      } catch (err) {
        console.log('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [refreshKey]);

  const routes = useMemo(() => {
    const baseRoutes = [{ key: 'all', title: 'Tất cả', icon: 'apps-outline' as any, image: null }];
    
    // Cố định khoảng 6 danh mục trên trang chủ bao gồm cả "Tất cả" (lấy tối đa 5 danh mục từ DB)
    const slicedCategories = categories.slice(0, 5);

    const categoryRoutes = slicedCategories.map((cat) => {
      let imageUrl = null;
      if (cat.image) {
        let tempUrl = cat.image;
        if (tempUrl.includes("localhost") || tempUrl.includes("127.0.0.1")) {
          const apiHost = URL_API.replace(/^https?:\/\//, "");
          tempUrl = tempUrl.replace(/(localhost|127\.0\.0\.1):3000/g, apiHost);
        }
        
        if (tempUrl.startsWith('http://') || tempUrl.startsWith('https://')) {
          imageUrl = tempUrl;
        } else {
          imageUrl = `${URL_API.replace(/\/api$/, "")}${tempUrl.startsWith('/') ? tempUrl : `/${tempUrl}`}`;
        }
      }
      return {
        key: String(cat.id),
        title: cat.name,
        icon: getCategoryIcon(cat.name),
        image: imageUrl,
      };
    });
    return [...baseRoutes, ...categoryRoutes];
  }, [categories]);

  const renderScene = ({ route }: any) => {
    return <ProductRoute categoryId={route.key} />;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: sizes._screen_height / 2 }}>
        <ActivityIndicator size="large" color={colors_global.blue_primary} />
      </View>
    );
  }

  // Nếu index hiện tại lớn hơn số lượng route khả dụng (ví dụ sau khi reset/thay đổi danh mục)
  const safeIndex = index >= routes.length ? 0 : index;

  return (
    <View style={{ height: sizes._screen_height }}>
      <TabView
        key={`${refreshKey}-${routes.length}`}
        style={{ flex: 1, marginBottom: sizes._100sdp }}
        navigationState={{ index: safeIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        lazy
        initialLayout={{ width: sizes._screen_width }}
        renderTabBar={(props) => <TabBarCustom {...props} />}
      />
    </View>
  );
};

export default ListProductTabBar;
