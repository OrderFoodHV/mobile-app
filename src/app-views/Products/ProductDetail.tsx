import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
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
import { addProductInCart } from "@redux/features/cartSlice";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string
  price: string;
  image: string;
};

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { product: Product } }, 'ProductDetail'>;

const ProductDetail: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params ?? {};
  const { goToCart, goToOrder } = useNavigationComponentApp()
  const dispatch = useDispatch<AppDispatch>();
  const { cartData } = useSelector((state: RootState) => state.cart, shallowEqual)
  const { tokenData } = useSelector((state: RootState) => state.auth, shallowEqual)
  const onPressAddCart = () => {
    if (tokenData && cartData && cartData?.id) {
      const data = {
        cart_id: cartData?.id,
        quantity: 1,
        product_id: product.id,
        total_price: product.price,
        token: tokenData,
        ...product
      }
      dispatch(addProductInCart(data))
    }
  }

  console.log('product', [product])

  return (
    <Container>
      <HeaderCustom
        title={'Chi tiết sản phẩm'}
        rightIcon={
          <TouchableOpacity onPress={() => goToCart()} style={{padding:10}}>
            <Feather name='shopping-cart' size={sizes._25sdp} color={colors.black} />
          </TouchableOpacity>
        } />
      <Content style={styles.container}>
        <AppImage source={{ uri: product.image }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={{ ...styles_c.row_direction_align_center, gap: 5, width: '100%' }}>
            <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.green_primary }]}
            onPress={onPressAddCart}>
              <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => goToOrder({products: [product], type: 'product_detail'})}>
              <Text style={styles.buttonText}>Đặt hàng ngay</Text>
            </TouchableOpacity>
          </View>
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
  }
});
