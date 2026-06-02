import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import styles_c from "@assets/styles/styles_c";
import colors from "@assets/colors/global_colors";
import { SafeAreaView } from "react-native-safe-area-context";
import AppImage from '@app-uikits/AppImage';
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import sizes from "@assets/styles/sizes";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { addProductInCart, clearCartData, getCartData } from "@redux/features/cartSlice";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";

type Product = {
  id: any;
  name: string;
  description: string;
  category: string;
  price: any;
  image: string;
  store_id?: any;
  store_name?: string;
  store_address?: string;
};

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { product: Product } }, 'ProductDetail'>;

const ProductDetail: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { product } = route.params ?? {};
  const { goToCart, goToOrder } = useNavigationComponentApp();
  const dispatch = useDispatch<AppDispatch>();

  const { cartData, productCartListData } = useSelector(
    (state: RootState) => state.cart,
    shallowEqual
  );
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual
  );
  const { paginationProductTypeAll } = useSelector(
    (state: RootState) => state.productList,
    shallowEqual
  );

  const fullProduct = React.useMemo(() => {
    if (!paginationProductTypeAll) return product;
    const found = paginationProductTypeAll.find((p: any) => Number(p.id) === Number(product.id));
    return found || product;
  }, [paginationProductTypeAll, product]);

  const [isFavorite, setIsFavorite] = React.useState(false);
  const [loadingFavorite, setLoadingFavorite] = React.useState(false);

  React.useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!tokenData || !fullProduct?.id) return;
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/users/favorites`,
        token: tokenData,
        showToast: false,
      });
      if (res && Array.isArray(res)) {
        const found = res.some((item: any) => Number(item.id) === Number(fullProduct.id));
        setIsFavorite(found);
      }
    };
    checkFavoriteStatus();
  }, [tokenData, fullProduct?.id]);

  const toggleFavorite = async () => {
    if (!tokenData) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }
    if (loadingFavorite) return;
    setLoadingFavorite(true);

    if (isFavorite) {
      const res = await useCallAPI({
        method: "DELETE",
        url: `${URL_API}/users/favorites/${fullProduct.id}`,
        token: tokenData,
        showToast: true,
        successTitle: "Đã xóa khỏi danh sách yêu thích!",
      });
      if (res && res.success !== false) {
        setIsFavorite(false);
      }
    } else {
      const res = await useCallAPI({
        method: "POST",
        url: `${URL_API}/users/favorites`,
        token: tokenData,
        data: { product_id: fullProduct.id },
        showToast: true,
        successTitle: "Đã thêm vào danh sách yêu thích!",
      });
      if (res && res.success !== false) {
        setIsFavorite(true);
      }
    }
    setLoadingFavorite(false);
  };

  React.useEffect(() => {
    if (tokenData) {
      dispatch(getCartData(tokenData));
    }
  }, [tokenData, dispatch]);

  const [storeReviews, setStoreReviews] = React.useState<any[]>([]);
  const [productReviews, setProductReviews] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchReviews = async () => {
      if (fullProduct.store_id) {
        try {
          const res = await useCallAPI({
            method: "GET",
            url: `${URL_API}/reviews/store/${fullProduct.store_id}`,
            showToast: false,
          });
          if (res && res.data) {
            setStoreReviews(res.data);
          }
        } catch (e) {
          console.log("Error fetching store reviews:", e);
        }
      }
      if (fullProduct.id) {
        try {
          const res = await useCallAPI({
            method: "GET",
            url: `${URL_API}/reviews/product/${fullProduct.id}`,
            showToast: false,
          });
          if (res && res.data) {
            setProductReviews(res.data);
          }
        } catch (e) {
          console.log("Error fetching product reviews:", e);
        }
      }
    };
    fetchReviews();
  }, [fullProduct.id, fullProduct.store_id]);



  const performAddCart = () => {
    if (tokenData && cartData && cartData?.id) {
      const data = {
        cart_id: cartData?.id,
        quantity: 1,
        product_id: fullProduct.id,
        total_price: fullProduct.price,
        token: tokenData,
        ...fullProduct
      };
      dispatch(addProductInCart(data));
    }
  };

  const onPressAddCart = () => {
    if (!tokenData) return;

    const hasDifferentStoreItem = productCartListData && productCartListData.length > 0 && productCartListData.some(
      (item: any) => Number(item.store_id) !== Number(fullProduct.store_id)
    );

    if (hasDifferentStoreItem) {
      const currentStoreName = (productCartListData[0] as any).store_name || "quán khác";

      Alert.alert(
        "Tạo giỏ hàng mới?",
        `Bạn đang có món của quán "${currentStoreName}" trong giỏ. Bạn có muốn xóa để tạo giỏ hàng mới với quán "${fullProduct.store_name || 'Quán mới'}" không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "OK",
            onPress: async () => {
              try {
                await dispatch(clearCartData(tokenData)).unwrap();
                performAddCart();
              } catch (error) {
                console.log("Error clearing cart and adding product:", error);
              }
            }
          }
        ],
        { cancelable: true }
      );
    } else {
      performAddCart();
    }
  };

  const storeProducts = React.useMemo(() => {
    if (!paginationProductTypeAll || !fullProduct.store_id) return [];
    return paginationProductTypeAll.filter(
      (p: any) => Number(p.store_id) === Number(fullProduct.store_id) && Number(p.id) !== Number(fullProduct.id)
    );
  }, [paginationProductTypeAll, fullProduct.store_id, fullProduct.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F9FC" }} edges={["top", "left", "right"]}>
      <HeaderCustom
        title={'Chi tiết sản phẩm'}
        rightIcon={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={toggleFavorite} style={[styles.cartIconWrapper, { marginRight: 8 }]} activeOpacity={0.7}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#EF4444" : "#FFF"} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goToCart()} style={styles.cartIconWrapper}>
              <Feather name='shopping-cart' size={22} color="#FFF" />
              {productCartListData && productCartListData.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{productCartListData.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Product Image Cover */}
        <View style={styles.imageWrapper}>
          <AppImage source={{ uri: fullProduct.image }} style={styles.image} />
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{fullProduct.category || "Món ngon"}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.name}>{fullProduct.name}</Text>
          <Text style={styles.price}>
            {Number(fullProduct.price).toLocaleString("vi-VN")} đ
          </Text>
          {fullProduct.description ? (
            <Text style={styles.description}>{fullProduct.description}</Text>
          ) : (
            <Text style={[styles.description, { fontStyle: "italic", color: "#9CA3AF" }]}>Chưa có mô tả chi tiết.</Text>
          )}

          {/* Quick Info Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.badgeItem}>
              <Feather name="clock" size={14} color="#6B7280" />
              <Text style={styles.badgeText}>15-20 phút</Text>
            </View>
            <View style={styles.badgeItem}>
              <Feather name="thumbs-up" size={14} color="#10B981" />
              <Text style={[styles.badgeText, { color: "#10B981", fontWeight: "600" }]}>Yêu thích</Text>
            </View>
            <View style={styles.badgeItem}>
              <Feather name="shield" size={14} color="#3B82F6" />
              <Text style={[styles.badgeText, { color: "#3B82F6" }]}>Đảm bảo</Text>
            </View>
          </View>

          {/* Call to Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnCart]}
              onPress={onPressAddCart}
            >
              <Feather name="shopping-bag" size={18} color={colors.blue_primary} style={{ marginRight: 6 }} />
              <Text style={[styles.btnActionText, { color: colors.blue_primary }]}>Thêm vào giỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnOrder]}
              onPress={() => goToOrder({ products: [fullProduct], type: 'product_detail' })}
            >
              <Feather name="zap" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={[styles.btnActionText, { color: "#fff" }]}>Đặt ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Card Info */}
        <View style={styles.storeCard}>
          <View style={styles.storeHeader}>
            <View style={styles.storeIconBg}>
              <Feather name="home" size={18} color="#3B82F6" />
            </View>
            <View style={styles.storeTextWrapper}>
              <Text style={styles.storeLabel}>Cửa hàng cung cấp</Text>
              <Text style={styles.storeName}>{fullProduct.store_name || "Quán Ăn ngon"}</Text>
            </View>
          </View>
          {fullProduct.store_address && (
            <View style={styles.storeAddressRow}>
              <Feather name="map-pin" size={14} color="#6B7280" style={{ marginRight: 6, marginTop: 2 }} />
              <Text style={styles.storeAddress}>{fullProduct.store_address}</Text>
            </View>
          )}
        </View>

        {/* 🌟 PHẦN REVIEW & ĐÁNH GIÁ CỦA MÓN ĂN & CỬA HÀNG */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionHeader}>Đánh giá & Nhận xét</Text>

          {/* Tab Món ăn */}
          <View style={styles.tabHeader}>
            <View style={styles.tabBadge}>
              <Text style={styles.tabTitle}>Món ăn ({productReviews.length})</Text>
            </View>
          </View>

          {productReviews.length === 0 ? (
            <View style={styles.emptyReviewCard}>
              <Text style={styles.emptyReviewText}>Món này chưa có đánh giá nào. Bạn sẽ là người đầu tiên chứ?</Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {productReviews.slice(0, 3).map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewUserRow}>
                    <Text style={styles.reviewUser}>{rev.user_name || "Khách hàng ẩn danh"}</Text>
                    <View style={styles.starsRow}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < Number(rev.rating) ? "star" : "star-outline"}
                          size={14}
                          color="#FBBF24"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment || "Đánh giá 5 sao!"}</Text>
                  <Text style={styles.reviewDate}>
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString("vi-VN") : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Tab Shop/Shipper */}
          <View style={[styles.tabHeader, { marginTop: 14 }]}>
            <View style={styles.tabBadge}>
              <Text style={styles.tabTitle}>Nhà hàng & Tài xế ({storeReviews.length})</Text>
            </View>
          </View>

          {storeReviews.length === 0 ? (
            <View style={styles.emptyReviewCard}>
              <Text style={styles.emptyReviewText}>Nhà hàng chưa nhận được nhận xét nào từ khách hàng.</Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {storeReviews.slice(0, 3).map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewUserRow}>
                    <Text style={styles.reviewUser}>{rev.user_name || "Người dùng ẩn danh"}</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {rev.store_rating && (
                        <View style={styles.ratingBadge}>
                          <Feather name="home" size={10} color="#D97706" />
                          <Text style={styles.ratingBadgeText}>{rev.store_rating} ⭐</Text>
                        </View>
                      )}
                      {rev.shipper_rating && (
                        <View style={[styles.ratingBadge, { backgroundColor: "#ECFDF5" }]}>
                          <Feather name="truck" size={10} color="#059669" />
                          <Text style={[styles.ratingBadgeText, { color: "#059669" }]}>{rev.shipper_rating} ⭐</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {rev.store_comment && (
                    <Text style={styles.reviewComment}>
                      <Text style={{ fontWeight: "600", color: "#374151" }}>Quán: </Text>
                      {rev.store_comment}
                    </Text>
                  )}
                  {rev.shipper_comment && (
                    <Text style={[styles.reviewComment, { marginTop: 2 }]}>
                      <Text style={{ fontWeight: "600", color: "#374151" }}>Tài xế: </Text>
                      {rev.shipper_comment}
                    </Text>
                  )}
                  
                  <Text style={styles.reviewDate}>
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString("vi-VN") : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <View style={styles.menuHeaderRow}>
            <Text style={styles.menuHeader}>Thực đơn quán</Text>
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>{storeProducts.length + 1} món</Text>
            </View>
          </View>

          {storeProducts.length === 0 ? (
            <View style={styles.emptyMenuCard}>
              <Feather name="coffee" size={24} color="#9CA3AF" style={{ marginBottom: 6 }} />
              <Text style={styles.emptyMenuText}>Quán chưa có món ăn khác đăng tải.</Text>
            </View>
          ) : (
            <View style={styles.menuList}>
              {storeProducts.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.replace("ProductDetail", { product: item });
                  }}
                  activeOpacity={0.7}
                >
                  <AppImage source={{ uri: item.image }} style={styles.menuItemImage} />
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>
                      {Number(item.price).toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                  <View style={styles.chevronBg}>
                    <Feather name="chevron-right" size={16} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  cartIconWrapper: {
    padding: 8,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 280,
    backgroundColor: "#E5E7EB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryTag: {
    position: "absolute",
    left: 16,
    bottom: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: -20,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingVertical: 12,
    marginBottom: 16,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  btnAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
  },
  btnCart: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: colors.blue_primary,
  },
  btnOrder: {
    backgroundColor: colors.blue_primary,
  },
  btnActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  storeCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  storeIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  storeTextWrapper: {
    flex: 1,
  },
  storeLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  storeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  storeAddressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  storeAddress: {
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
  },
  menuSection: {
    marginHorizontal: 14,
    marginTop: 16,
  },
  menuHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  menuHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  emptyMenuCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  emptyMenuText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    gap: 12,
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "700",
  },
  chevronBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  menuBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuBadgeText: {
    fontSize: 12,
    color: colors.blue_primary,
    fontWeight: "600",
  },
  reviewSection: {
    marginHorizontal: 14,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  tabHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tabBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.blue_primary,
  },
  emptyReviewCard: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  emptyReviewText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  reviewList: {
    gap: 10,
    marginTop: 6,
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  reviewUserRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewUser: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewComment: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
  },
  reviewDate: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
    textAlign: "right",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#D97706",
  },
});
