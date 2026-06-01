import sizes from "@assets/styles/sizes";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native"
import fastFoodData from '../../../data/fast_food.json';
import AppImage from '@app-uikits/AppImage';
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { AppDispatch, RootState } from "@redux/store";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getProductData, resetProductTypeAll, resetProductTypeFastFood } from "@redux/features/productListSlice";
import { useState, useEffect, Fragment } from "react";
import LoadingBase from "@app-components/LoadingBase/LoadingBase";
import React from "react";

interface SecondProductRouteProps { }
const SecondProductRoute: React.FC<SecondProductRouteProps> = () => {
  const { goToProductDetail } = useNavigationComponentApp()

  const dispatch = useDispatch<AppDispatch>();
  const { currentPagePaginationProductTypeFastFood, hasFetchedPaginationProductTypeFastFood, hasMorePaginationProductTypeFastFood, paginationProductTypeFastFood, productListLoading } = useSelector((state: RootState) => state.productList, shallowEqual)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [triggerResetData, setTriggerResetData] = useState<boolean>(false)

  useEffect(() => {
    if (!hasFetchedPaginationProductTypeFastFood && !triggerResetData) {
      dispatch(getProductData({ page: 1, limit: 10, type: 'fast_food', filterColumn: 'category', filterValue: 'fast_food' }))
      setTriggerResetData(true)
    }
  }, [hasFetchedPaginationProductTypeFastFood, triggerResetData])

  const handleLoadMore = () => {
    if (currentPagePaginationProductTypeFastFood > 1 && hasMorePaginationProductTypeFastFood && !productListLoading) {
       dispatch(getProductData({ page: currentPagePaginationProductTypeFastFood, limit: 10, type: 'fast_food', filterColumn: 'category', filterValue: 'fast_food' }))
    }
  }

  const onRefreshData = () => {
    if (!productListLoading) {
      setRefreshing(true)
      setTriggerResetData(false)
      dispatch(resetProductTypeFastFood())
      setRefreshing(false)
    }
  }

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity style={{ width: '45%', margin: 10 }} onPress={() => goToProductDetail({ product: item })}>
      <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 3 }}>
        <AppImage
          source={{ uri: item.image }}
          style={{ width: '100%', height: sizes._160sdp, borderRadius: 8 }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>
          {item.name}
        </Text>
        <Text style={{ color: '#888', marginVertical: 4 }}>
          {item.description}
        </Text>
        <Text style={{ color: '#e67e22', fontWeight: '600' }}>
         {
            Number(item?.price || 0).toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 5, paddingBottom: 60 }}>
      <FlatList
        data={paginationProductTypeFastFood || []}
        keyExtractor={(item, index) => item.id ? item?.id.toString() : index.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        ListFooterComponent={
          <Fragment>
           { productListLoading && <LoadingBase/>}
          </Fragment>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />}
        contentContainerStyle={{ gap: 10 }}
        renderItem={renderItem}
      />
    </View>
  );
}
export default SecondProductRoute