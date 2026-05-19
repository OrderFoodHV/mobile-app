import HeaderApp from "@app-components/HeaderApp/HeaderApp";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import ListProductTabBar from "./components/ListProductTabBar";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { getCartData } from "@redux/features/cartSlice";
import React from "react";
import { useAppTheme } from "src/app-context/ThemeContext";

interface HomeProps {}
const Home: React.FC<HomeProps> = () => {
  const { themeColors } = useAppTheme();
  const { goToCart } = useNavigationComponentApp();

  const dispatch = useDispatch<AppDispatch>();
  const { hasFetchedCartData } = useSelector(
    (state: RootState) => state.cart,
    shallowEqual,
  );
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  useEffect(() => {
    if (!hasFetchedCartData && tokenData) {
      dispatch(getCartData(tokenData));
    }
  }, [tokenData, hasFetchedCartData]);

  return (
    <Container style={{ flex: 1, backgroundColor: themeColors.bg }}>
      {/* HEADER */}
      <View
        style={{
          backgroundColor: colors.blue_primary,
          paddingTop: sizes._20sdp,
          paddingBottom: sizes._15sdp,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View
          style={{
            ...styles_c.row_direction_align_center,
            justifyContent: "space-between",
          }}
        >
          <HeaderApp title="Trang chủ" />

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <TouchableOpacity style={styles.headerButton}>
              <AntDesign name="heart" size={20} color="#EF4444" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => goToCart()}
              style={styles.headerButton}
            >
              <Feather
                name="shopping-cart"
                size={20}
                color={colors.blue_primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* CONTENT DANH SÁCH MÓN ĂN - ĐÃ BỎ HOÀN TOÀN KHỐI LỘ VOUCHER */}
      <View style={{ flex: 1, marginTop: 10 }}>
        <ListProductTabBar />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 50,
    elevation: 4,
  },
});

export default Home;
