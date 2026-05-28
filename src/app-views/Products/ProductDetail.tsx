import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import styles_c from "@assets/styles/styles_c";
import colors from "@assets/colors/global_colors";
import { Container, Content } from "@app-layout/Layout";
import AppImage from '@app-uikits/AppImage';
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import sizes from "@assets/styles/sizes";
import { Feather } from '@expo/vector-icons';
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { addProductInCart, clearCartData } from "@redux/features/cartSlice";

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

  // Get the latest joined store_name / store_address from Redux store using product.id
  const fullProduct = React.useMemo(() => {
    if (!paginationProductTypeAll) return product;
    const found = paginationProductTypeAll.find((p: any) => Number(p.id) === Number(product.id));
    return found || product;
  }, [paginationProductTypeAll, product]);

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

    // Check if cart has items from another store
    const hasDifferentStoreItem = productCartListData && productCartListData.length > 0 && productCartListData.some(
      (item: any) => Number(item.store_id) !== Number(fullProduct.store_id)
    );

    if (hasDifferentStoreItem) {
      // Find the name of the store currently in the cart
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

  // Filter other products from the same store
  const storeProducts = React.useMemo(() => {
    if (!paginationProductTypeAll || !fullProduct.store_id) return [];
    return paginationProductTypeAll.filter(
      (p: any) => Number(p.store_id) === Number(fullProduct.store_id) && Number(p.id) !== Number(fullProduct.id)
    );
  }, [paginationProductTypeAll, fullProduct.store_id, fullProduct.id]);

  console.log('productDetail product:', fullProduct);

  return (
    <Container>
      <HeaderCustom
        title={'Chi tiết sản phẩm'}
        rightIcon={
          <TouchableOpacity onPress={() => goToCart()} style={{ padding: 10 }}>
            <Feather name='shopping-cart' size={sizes._25sdp} color={colors.black} />
          </TouchableOpacity>
        }
      />
      <Content style={styles.container}>
        <AppImage source={{ uri: fullProduct.image }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.name}>{fullProduct.name}</Text>
          <Text style={styles.price}>
            {Number(fullProduct.price).toLocaleString("vi-VN")}đ
          </Text>
          <Text style={styles.description}>{fullProduct.description}</Text>

          <View style={{ ...styles_c.row_direction_align_center, gap: 10, width: '100%', marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.green_primary }]}
              onPress={onPressAddCart}
            >
              <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => goToOrder({ products: [fullProduct], type: 'product_detail' })}
            >
              <Text style={styles.buttonText}>Đặt hàng ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Menu Section */}
        <View style={styles.storeSection}>
          <View style={styles.divider} />
          <Text style={styles.storeTitle}>
            🏫 Cửa hàng: {fullProduct.store_name || "Quán Ăn ngon"}
          </Text>
          {fullProduct.store_address && (
            <Text style={styles.storeAddress}>📍 {fullProduct.store_address}</Text>
          )}

          <Text style={styles.menuHeader}>Thực đơn của quán</Text>

          {storeProducts.length === 0 ? (
            <Text style={styles.emptyMenuText}>Không có món ăn nào khác.</Text>
          ) : (
            <View style={styles.menuList}>
              {storeProducts.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.replace("ProductDetail", { product: item });
                  }}
                >
                  <AppImage source={{ uri: item.image }} style={styles.menuItemImage} />
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>
                      {Number(item.price).toLocaleString("vi-VN")}đ
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={sizes._18sdp} color={colors.gray_primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Content>
    </Container>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1
  },
  image: {
    width: "100%",
    height: sizes._300sdp
  },
  content: {
    padding: 16
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8
  },
  price: {
    fontSize: 18,
    color: "#e67e22",
    marginBottom: 12
  },
  description: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20
  },
  button: {
    backgroundColor: "#e67e22",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  storeSection: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 40,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  menuHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.blue_primary,
    marginBottom: 12,
  },
  emptyMenuText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    gap: 12,
  },
  menuItemImage: {
    width: sizes._50sdp,
    height: sizes._50sdp,
    borderRadius: 6,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 13,
    color: "#e67e22",
    fontWeight: "bold",
  },
});
