import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { Container, Content, Footer } from "@app-layout/Layout";
import CheckBox from "@app-components/CheckBoxCustom/CheckBoxCustom";
import colors from "@assets/colors/global_colors";
import AppImage from "@app-uikits/AppImage";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import {
  getProductCartListData,
  increaseProductQuantityInCart,
  removeProductInCart,
  resetAllCart,
  resetIncreaseProductQuantityInCartResponse,
  updateQuantityOfProductInCart,
} from "@redux/features/cartSlice";
import { ProductCartData } from "@app-schemas/Cart/cart";

const Cart: React.FC = () => {
  const { goToProductDetail, goToOrder } = useNavigationComponentApp();
  const dispatch = useDispatch<AppDispatch>();
  const {
    cartData,
    currentPageProductCartListData,
    cartLoading,
    hasFetchedProductCartListData,
    hasMoreProductCartListData,
    productCartListData,
    increaseProductQuantityInCartResponse,
  } = useSelector((state: RootState) => state.cart, shallowEqual);

  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerResetData, setTriggerResetData] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<ProductCartData[]>([]);

  // 🌟 THÊM MỚI STATE: Quản lý chữ ghi chú khách hàng gõ vào
  const [orderNote, setOrderNote] = useState<string>("");

  const toggleSelection = (item: ProductCartData) => {
    setCartItems((prevCartItems) => {
      const safeItems = prevCartItems || [];
      const isSelected = safeItems.some(
        (cartItem) => cartItem?.product_id === item?.product_id,
      );

      if (isSelected) {
        return safeItems.filter(
          (cartItem) => cartItem.product_id !== item.product_id,
        );
      } else {
        return [...safeItems, item];
      }
    });
  };

  useEffect(() => {
    if (
      cartData &&
      cartData?.id &&
      !hasFetchedProductCartListData &&
      !triggerResetData
    ) {
      dispatch(
        getProductCartListData({
          page: 1,
          limit: 10,
          filterColumn: "cart_id",
          filterValue: cartData?.id,
          token: tokenData || undefined,
        }),
      );
      setTriggerResetData(true);
    }
  }, [cartData, hasFetchedProductCartListData, triggerResetData, tokenData]);

  const handleLoadMore = () => {
    if (
      currentPageProductCartListData > 1 &&
      hasMoreProductCartListData &&
      !cartLoading &&
      cartData &&
      cartData?.id
    ) {
      dispatch(
        getProductCartListData({
          page: currentPageProductCartListData,
          limit: 10,
          filterColumn: "cart_id",
          filterValue: cartData?.id,
          token: tokenData || undefined,
        }),
      );
    }
  };

  const onRefreshData = () => {
    if (!cartLoading) {
      setRefreshing(true);
      setTriggerResetData(false);
      dispatch(resetAllCart());
      setRefreshing(false);
    }
  };

  const DEBOUNCE_TIME = 300;
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onUpdateProductQuantity = ({
    cart_id,
    price,
    product_id,
    quantity,
    type,
  }: any) => {
    let newQuantity = quantity;
    if (type === "increase") newQuantity = quantity + 1;
    else if (type === "decrease") newQuantity = quantity - 1;

    if (newQuantity < 1) return;

    setPendingUpdate({
      cart_id,
      price: String(price),
      product_id: Number(product_id),
      quantity: newQuantity,
      token: tokenData || undefined,
    });
  };

  useEffect(() => {
    if (pendingUpdate) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        dispatch(increaseProductQuantityInCart(pendingUpdate));
      }, DEBOUNCE_TIME);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [pendingUpdate]);

  useEffect(() => {
    if (
      increaseProductQuantityInCartResponse &&
      increaseProductQuantityInCartResponse.success &&
      increaseProductQuantityInCartResponse.response
    ) {
      dispatch(
        updateQuantityOfProductInCart(
          increaseProductQuantityInCartResponse.response,
        ),
      );
      dispatch(resetIncreaseProductQuantityInCartResponse());
    } else if (increaseProductQuantityInCartResponse) {
      dispatch(resetIncreaseProductQuantityInCartResponse());
      onRefreshData();
    }
  }, [increaseProductQuantityInCartResponse]);

  const totalSelectedPrice = (cartItems || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const handleCreateOrder = () => {
    const safeCartItems = cartItems || [];
    if (safeCartItems.length > 0) {
      const formattedProducts = safeCartItems.map((item: any) => ({
        id: item.product_id || item.id,
        product_id: item.product_id || item.id,
        store_id: item.store_id || 1,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total_price: Number(item.price) * Number(item.quantity),
      }));

      // 🌟 SỬA ĐỒNG BỘ: Truyền kèm trường 'note' gõ từ UI vào luồng điều hướng goToOrder
      goToOrder({
        products: formattedProducts,
        type: "cart",
        note: orderNote || "",
      });
    } else {
      Alert.alert(
        "Thông báo",
        "Sếp vui lòng tích chọn món ăn muốn mua đã nhé nhen!",
      );
    }
  };

  return (
    <Container style={{ backgroundColor: "#F9FAFB" }}>
      <HeaderCustom title="Giỏ hàng" isShowLeftButton={false} />
      <FlatList
        data={[1]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.7}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />
        }
        renderItem={() => (
          <Fragment>
            <View style={{ padding: 16 }}>
              <Text style={{ ...styles_c.font_text_16_600 }}>
                Sản phẩm đã chọn
              </Text>
            </View>
            <FlatList
              data={productCartListData || []}
              keyExtractor={(item, index) =>
                item?.product_id ? item.product_id.toString() : index.toString()
              }
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <CheckBox
                    checked={(cartItems || []).some(
                      (cartItem) => cartItem.product_id === item.product_id,
                    )}
                    onPress={() => toggleSelection(item)}
                    containerStyle={styles.checkbox}
                  />

                  <AppImage
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode={"cover"}
                  />

                  <View style={{ flex: 1, marginLeft: 10, gap: 6 }}>
                    <Text style={styles.name} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.price}>
                      {Number(item.price).toLocaleString()} đ
                    </Text>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          onUpdateProductQuantity({
                            cart_id: item.cart_id,
                            price: item.price,
                            product_id: item.product_id,
                            quantity: item.quantity,
                            type: "decrease",
                          })
                        }
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.input}>{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() =>
                          onUpdateProductQuantity({
                            cart_id: item.cart_id,
                            price: item.price,
                            product_id: item.product_id,
                            quantity: item.quantity,
                            type: "increase",
                          })
                        }
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      dispatch(
                        removeProductInCart({
                          product_id: item?.product_id,
                          cart_id: item?.cart_id,
                          token: tokenData || undefined,
                        }),
                      )
                    }
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </Fragment>
        )}
      />

      <Footer style={styles.footerContainer}>
        {/* 🌟 THÊM MỚI: Ô NHẬP GHI CHÚ TỰ DO CHO KHÁCH HÀNG (DẠNG OPTIONAL) */}
        <View style={styles.noteWrapper}>
          <TextInput
            style={styles.noteInput}
            placeholder="Ghi chú cho cửa hàng (Ví dụ: Ít cay, không hành...)"
            placeholderTextColor="#9CA3AF"
            value={orderNote}
            onChangeText={setOrderNote}
          />
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Tạm tính ({(cartItems || []).length} món):
          </Text>
          <Text style={styles.priceValue}>
            {totalSelectedPrice.toLocaleString()} đ
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleCreateOrder}>
          <Text style={styles.buttonText}>Đặt hàng ngay</Text>
        </TouchableOpacity>
      </Footer>
    </Container>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  checkbox: { padding: 0, marginRight: 6 },
  image: {
    width: sizes._80sdp,
    height: sizes._80sdp,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  name: { fontSize: 15, fontWeight: "600", color: "#333" },
  price: { fontSize: 14, color: colors.red_pattel, fontWeight: "600" },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: { fontSize: 16, fontWeight: "bold", color: "#4B5563" },
  input: {
    width: 35,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  footerContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  // 🌟 STYLE THÊM MỚI CỦA Ô NHẬP GHI CHÚ:
  noteWrapper: {
    marginBottom: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  noteInput: {
    fontSize: 13,
    color: "#111827",
    paddingVertical: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  priceLabel: { fontSize: 14, color: "#6B7280" },
  priceValue: { fontSize: 16, fontWeight: "700", color: colors.red_pattel },
  button: {
    backgroundColor: colors.blue_primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteButton: {
    marginLeft: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: { color: "#EF4444", fontSize: 16, fontWeight: "bold" },
});

export default Cart;
