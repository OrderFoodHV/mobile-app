import React, { Fragment, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Image, TouchableOpacity, RefreshControl } from 'react-native';
import HeaderCustom from '@app-components/HeaderCustom/HeaderCustom';
import { Container, Content, Footer } from '@app-layout/Layout';
import CheckBox from '@app-components/CheckBoxCustom/CheckBoxCustom';
import colors from '@assets/colors/global_colors';
import AppImage from '@app-uikits/AppImage';
import { useNavigationComponentApp } from '@app-helper/navigateToScreens';
import sizes from '@assets/styles/sizes';
import snacksData from '../../data/snacks.json';
import styles_c from '@assets/styles/styles_c';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import { getProductCartListData, increaseProductQuantityInCart, removeProductInCart, resetAllCart, resetIncreaseProductQuantityInCartResponse, updateQuantityOfProductInCart } from '@redux/features/cartSlice';
import { ProductCartData } from '@app-schemas/Cart/cart';

interface ProductInCart {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selected: boolean;
  image: string;
}

const Cart: React.FC = () => {
  const { goToProductDetail, goToOrder } = useNavigationComponentApp()
  const dispatch = useDispatch<AppDispatch>();
  const { cartData, currentPageProductCartListData, cartLoading, hasFetchedProductCartListData, hasMoreProductCartListData, productCartListData, increaseProductQuantityInCartResponse } = useSelector((state: RootState) => state.cart, shallowEqual)
  const { tokenData } = useSelector((state: RootState) => state.auth, shallowEqual)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [triggerResetData, setTriggerResetData] = useState<boolean>(false)
  const [cartItems, setCartItems] = useState<ProductCartData[]>([]);

  const toggleSelection = (item: ProductCartData) => {
    setCartItems((prevCartItems) => {
      const isSelected = prevCartItems.some(cartItem => cartItem?.product_id === item?.product_id);

      if (isSelected) {
        return prevCartItems?.filter(cartItem => cartItem.product_id !== item.product_id);
      } else {
        return [...prevCartItems, item];
      }
    });
  };

  console.log('cartItems', cartItems)


  useEffect(() => {
    if (cartData && cartData?.id && !hasFetchedProductCartListData && !triggerResetData) {
      dispatch(getProductCartListData({ page: 1, limit: 10, filterColumn: 'cart_id', filterValue: cartData?.id, token: tokenData || undefined }))
      setTriggerResetData(true)
    }
  }, [cartData, hasFetchedProductCartListData, triggerResetData, tokenData])


  const handleLoadMore = () => {
    if (currentPageProductCartListData > 1 && hasMoreProductCartListData && !cartLoading && cartData && cartData?.id) {
      dispatch(getProductCartListData({ page: currentPageProductCartListData, limit: 10, filterColumn: 'cart_id', filterValue: cartData?.id, token: tokenData || undefined }))
    }
  }

  const onRefreshData = () => {
    if (!cartLoading) {
      setRefreshing(true)
      setTriggerResetData(false)
      dispatch(resetAllCart())
      setRefreshing(false)
    }
  }
  const renderItem = ({ item, index }: { item: ProductCartData, index: number }) => (
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
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const DEBOUNCE_TIME = 300;

  const [pendingUpdate, setPendingUpdate] = useState<{
    cart_id: number;
    price: string | number;
    product_id: number;
    quantity: number;
    token?: string;
  } | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const onUpdateProductQuantity = ({ cart_id, price, product_id, quantity, type }: {
    cart_id: number;
    price: string | number
    product_id: number | string;
    quantity: number;
    type: 'increase' | 'decrease' | 'text_input'
  }) => {
    let newQuantity = quantity
    if (type === 'increase') {
      newQuantity = quantity + 1
    } else if (type === 'decrease') {
      newQuantity = quantity - 1
    } else if (type === 'text_input') {
      newQuantity = quantity
    }
    setPendingUpdate({ cart_id, price: String(price), product_id: Number(product_id), quantity: newQuantity, token: tokenData || undefined });
  };

  useEffect(() => {
    if (pendingUpdate) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        dispatch(increaseProductQuantityInCart(pendingUpdate));
      }, DEBOUNCE_TIME);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [pendingUpdate]);

  useEffect(() => {
    if (increaseProductQuantityInCartResponse && increaseProductQuantityInCartResponse.success && increaseProductQuantityInCartResponse.response) {
      dispatch(updateQuantityOfProductInCart(increaseProductQuantityInCartResponse.response));
      dispatch(resetIncreaseProductQuantityInCartResponse());
    } else if (increaseProductQuantityInCartResponse) {
      dispatch(resetIncreaseProductQuantityInCartResponse());
      onRefreshData();
    }
  }, [increaseProductQuantityInCartResponse]);

  const handleCreateOrder = () => {
    if(Array.isArray(cartItems) && cartItems?.length > 0){
      goToOrder({products: cartItems, type: 'cart'})
    }
  }



  return (
    <Container>
      <HeaderCustom title="Giỏ hàng" />
      <FlatList
        data={[1]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.7}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />}
        renderItem={() => (
          <Fragment>
            <View style={{ padding: 10 }}>
              <Text style={{ ...styles_c.font_text_16_600 }}>Sản phẩm đã chọn</Text>
            </View>
            <FlatList
              data={productCartListData}
              keyExtractor={(item, index) => item?.product_id ? item?.product_id.toString() : index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <CheckBox
                    checked={cartItems.some(cartItem => cartItem.product_id === item.product_id)}
                    onPress={() => toggleSelection(item)}
                    containerStyle={styles.checkbox}
                  />

                  <AppImage
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode={'cover'}
                  />

                  <View style={{ flex: 1, marginLeft: 10, gap: 10 }}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        onPress={() => onUpdateProductQuantity({
                          cart_id: item.cart_id,
                          price: item.price,
                          product_id: item.product_id,
                          quantity: item.quantity,
                          type: 'decrease'
                        })}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityText}>-</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={item.quantity.toString()}
                        onChangeText={text => {
                          const num = parseInt(text) || 1;
                          onUpdateProductQuantity({
                            cart_id: item.cart_id,
                            price: item.price,
                            product_id: item.product_id,
                            quantity: num,
                            type: 'text_input'
                          })
                        }}
                      />

                      <TouchableOpacity
                        onPress={() => onUpdateProductQuantity({
                          cart_id: item.cart_id,
                          price: item.price,
                          product_id: item.product_id,
                          quantity: item.quantity,
                          type: 'increase'
                        })}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => dispatch(removeProductInCart({ product_id: item?.product_id, cart_id: item?.cart_id, token: tokenData || undefined }))}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

              )}
            />
            {/* <View style={{ padding: 10 }}>
              <Text style={{ ...styles_c.font_text_16_600 }}>Gợi ý sản phẩm</Text>
            </View>
            <View style={{ flex: 1, padding: 5, paddingBottom: 30 }}>
              <FlatList
                data={snacksData}
                keyExtractor={(item, index) => item.id ? item?.id.toString() : index.toString()}
                numColumns={2}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
                renderItem={renderItem}
              />
            </View> */}
          </Fragment>
        )}
      />
      <Footer>
        <TouchableOpacity style={styles.button} onPress={handleCreateOrder}>
          <Text style={styles.buttonText}>Đặt hàng ngay</Text>
        </TouchableOpacity>
      </Footer>
    </Container>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  checkbox: {
    padding: 0,
    marginRight: 6,
  },
  image: {
    width: sizes._80sdp,
    height: sizes._80sdp,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    color: colors.red_pattel,
    fontWeight: '600'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: 40,
    height: 28,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
    textAlign: 'center',
    borderRadius: 4,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: colors.blue_primary,
    padding: 12,
    margin: 20,
    marginBottom: 30,
    borderRadius: 10,
    alignItems: "center",

  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  deleteButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: sizes._25sdp,
    fontWeight: 'bold',
    lineHeight: 18,
  },

});

export default Cart;
