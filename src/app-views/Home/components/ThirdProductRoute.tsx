import sizes from "@assets/styles/sizes";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native"
import snacksData from '../../../data/snacks.json';
import AppImage from '@app-uikits/AppImage';
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { getProductData, resetProductTypeSnacks } from "@redux/features/productListSlice";
import { AppDispatch, RootState } from "@redux/store";
import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import LoadingBase from "@app-components/LoadingBase/LoadingBase";
import React from "react";

interface ThirdProductRouteProps {}
const ThirdProductRoute:React.FC<ThirdProductRouteProps> = () => {
  const {goToProductDetail} = useNavigationComponentApp()
  const dispatch = useDispatch<AppDispatch>();
  const { currentPagePaginationProductTypeSnacks, hasFetchedPaginationProductTypeSnacks, hasMorePaginationProductTypeSnacks, paginationProductTypeSnacks, productListLoading } = useSelector((state: RootState) => state.productList, shallowEqual)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [triggerResetData, setTriggerResetData] = useState<boolean>(false)

  useEffect(() => {
    if (!hasFetchedPaginationProductTypeSnacks && !triggerResetData) {
      dispatch(getProductData({ page: 1, limit: 10, type: 'snacks', filterColumn: 'category', filterValue: 'snacks' }))
      setTriggerResetData(true)
    }
  }, [hasFetchedPaginationProductTypeSnacks, triggerResetData])

  const handleLoadMore = () => {
    if (currentPagePaginationProductTypeSnacks > 1 && hasMorePaginationProductTypeSnacks && !productListLoading) {
       dispatch(getProductData({ page: currentPagePaginationProductTypeSnacks, limit: 10, type: 'snacks', filterColumn: 'category', filterValue: 'snacks' }))
    }
  }

  const onRefreshData = () => {
    if (!productListLoading) {
      setRefreshing(true)
      setTriggerResetData(false)
      dispatch(resetProductTypeSnacks())
      setRefreshing(false)
    }
  }
  const renderItem = ({ item, index }: {item:any, index:number}) => (
    <TouchableOpacity style={{ width: '45%', margin: 10 }} onPress={()=> goToProductDetail({product: item})}>
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
    <View style={{flex:1, padding:5, marginBottom:60}}>
      <FlatList
        data={paginationProductTypeSnacks || []}
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
        contentContainerStyle={{gap:10}}
        renderItem={renderItem}
      />
    </View>
  );
}
export default ThirdProductRoute