import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native"
import allData from '../../../data/all.json';
import AppImage from '@app-uikits/AppImage';
import sizes from "@assets/styles/sizes";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { Fragment, useEffect, useState } from "react";
import { getProductData, resetProductTypeAll } from "@redux/features/productListSlice";
import LoadingBase from "@app-components/LoadingBase/LoadingBase";
import React from "react";

interface FirstProductRouteProps { }
const FirstProductRoute: React.FC<FirstProductRouteProps> = () => {
  const { goToProductDetail } = useNavigationComponentApp()
  const dispatch = useDispatch<AppDispatch>();
  const { currentPagePaginationProductTypeAll, hasFetchedPaginationProductTypeAll, hasMorePaginationProductTypeAll, paginationProductTypeAll, productListLoading } = useSelector((state: RootState) => state.productList, shallowEqual)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [triggerResetData, setTriggerResetData] = useState<boolean>(false)

  useEffect(() => {
    if (!hasFetchedPaginationProductTypeAll && !triggerResetData) {
      dispatch(getProductData({ page: 1, limit: 10, type: 'all' }))
      setTriggerResetData(true)
    }
  }, [hasFetchedPaginationProductTypeAll, triggerResetData])

  const handleLoadMore = () => {
    if (currentPagePaginationProductTypeAll > 1 && hasMorePaginationProductTypeAll && !productListLoading) {
      dispatch(getProductData({ page: currentPagePaginationProductTypeAll, limit: 10, type: 'all' }))
    }
  }

  const onRefreshData = () => {
    if (!productListLoading) {
      setRefreshing(true)
      setTriggerResetData(false)
      dispatch(resetProductTypeAll())
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
        data={paginationProductTypeAll || []}
        keyExtractor={(item, index) => item.id ? item?.id.toString() : index.toString()}
        numColumns={2}
       onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        ListFooterComponent={
          <Fragment>
           { productListLoading && <LoadingBase/>}
          </Fragment>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        renderItem={renderItem}
      />
    </View>
  );
}
export default FirstProductRoute