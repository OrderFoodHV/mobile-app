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
import { Feather } from "@expo/vector-icons";
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
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [orderNote, setOrderNote] = useState<string>("");

  const toggleSelection = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
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

  const selectedItems = (productCartListData || []).filter((item) =>
    selectedProductIds.includes(Number(item.product_id))
  );

  const totalSelectedPrice = selectedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const handleCreateOrder = () => {
    if (selectedItems.length > 0) {
      const formattedProducts = selectedItems.map((item: any) => ({
        id: item.product_id || item.id,
        product_id: item.product_id || item.id,
        store_id: item.store_id || 1,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total_price: Number(item.price) * Number(item.quantity),
      }));

      goToOrder({
        products: formattedProducts,
        type: "cart",
        note: orderNote || "",
      });
    } else {
      Alert.alert(
        "Thông báo",
        "Sếp vui lòng chọn món ăn muốn thanh toán đã nhé!",
      );
    }
  };

  const hasItems = productCartListData && productCartListData.length > 0;

  return (
    <Container style={{ backgroundColor: "#F7F9FC" }}>
      <HeaderCustom title="Giỏ hàng" isShowLeftButton={false} />
      <View style={{ flex: 1 }}>
        {hasItems ? (
          <FlatList
            data={[1]}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.7}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />
            }
            renderItem={() => (
              <Fragment>
                <View style={styles.sectionHeader}>
                  <Feather name="shopping-bag" size={16} color={colors.blue_primary} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Món đã thêm vào giỏ</Text>
                </View>
                <FlatList
                  data={productCartListData || []}
                  keyExtractor={(item, index) =>
                    item?.product_id ? item.product_id.toString() : index.toString()
                  }
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                      <CheckBox
                        checked={selectedProductIds.includes(Number(item.product_id))}
                        onPress={() => toggleSelection(Number(item.product_id))}
                        containerStyle={styles.checkbox}
                      />

                      <AppImage
                        source={{ uri: item.image }}
                        style={styles.image}
                        resizeMode={"cover"}
                      />

                      <View style={styles.itemInfo}>
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
                            style={styles.qtyBtn}
                            activeOpacity={0.7}
                          >
                            <Feather name="minus" size={12} color="#4B5563" />
                          </TouchableOpacity>

                          <Text style={styles.qtyText}>{item.quantity}</Text>

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
                            style={styles.qtyBtn}
                            activeOpacity={0.7}
                          >
                            <Feather name="plus" size={12} color="#4B5563" />
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
                        activeOpacity={0.7}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </Fragment>
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Feather name="shopping-cart" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>Giỏ hàng đang trống trơn sếp ơi</Text>
            <Text style={styles.emptySubtext}>Hãy quay lại thực đơn để chọn những món ăn hấp dẫn nhen!</Text>
          </View>
        )}

        {hasItems && (
          <View style={styles.footerWrapper}>
            <View style={styles.noteWrapper}>
              <Feather name="edit-3" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.noteInput}
                placeholder="Ghi chú (Ví dụ: Ít cay, không hành...)"
                placeholderTextColor="#9CA3AF"
                value={orderNote}
                onChangeText={setOrderNote}
              />
            </View>

            <View style={styles.footerRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Tạm tính ({selectedItems.length} món)</Text>
                <Text style={styles.priceValue}>
                  {totalSelectedPrice.toLocaleString()} đ
                </Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleCreateOrder} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Đặt hàng</Text>
                <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 150,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: { 
    marginRight: 8,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#1F2937",
    marginBottom: 4,
  },
  price: { 
    fontSize: 13, 
    color: "#EF4444", 
    fontWeight: "700",
    marginBottom: 6,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    padding: 3,
    alignSelf: "flex-start",
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  qtyText: { 
    fontSize: 12, 
    fontWeight: "600", 
    color: "#1F2937",
    marginHorizontal: 10,
  },
  deleteButton: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  footerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  noteWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  noteInput: {
    flex: 1,
    fontSize: 13,
    color: "#1F2937",
    padding: 0,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: { 
    fontSize: 11, 
    color: "#6B7280",
    marginBottom: 2,
  },
  priceValue: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#EF4444",
  },
  button: {
    backgroundColor: colors.blue_primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.blue_primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 15, 
    fontWeight: "700",
  },
});

export default Cart;
