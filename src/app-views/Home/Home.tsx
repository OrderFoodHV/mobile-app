import HeaderApp from "@app-components/HeaderApp/HeaderApp";
import SearchBar from "@app-components/SearchBar/SearchBar";
import { Container, Content } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import { useEffect, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons"; // Thêm AntDesign để vẽ Trái tim
import ListProductTabBar from "./components/ListProductTabBar";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { getCartData } from "@redux/features/cartSlice";
import React from "react";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useAppTheme } from "src/app-context/ThemeContext";

interface HomeProps {}
const Home: React.FC<HomeProps> = () => {
  const { themeColors } = useAppTheme();
  const { goToCart } = useNavigationComponentApp();
  const [textSearch, setTextSearch] = useState<string>("");

  // Data mẫu Voucher cho sếp làm màu lướt ngang cực xịn
  const vouchers = [
    { id: "1", code: "DAN_KY_THUAT", desc: "Giảm 20k cho dân HUCE 🛠️" },
    { id: "2", code: "INORDER66", desc: "Freeship đơn từ 0đ 🛵" },
    { id: "3", code: "AN_DEM_XIN", desc: "Giảm 10% tổng hóa đơn 🍕" },
  ];

  const getProductData = async () => {
    const response = await useCallAPI({
      method: "GET",
      url: `${URL_API}/products`,
    });
  };

  const receiveTextSearch = (text: string) => {
    setTextSearch(textSearch);
  };

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
          {/* TITLE */}
          <HeaderApp title="Trang chủ" />

          {/* CỤM NÚT TÍNH NĂNG GÓC PHẢI */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            {/* 🌟 NÚT MÓN ĂN YÊU THÍCH (FAVORITE) */}
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Yêu thích",
                  "Đang mở danh sách món ăn yêu thích của sếp! ❤️",
                )
              }
              style={styles.headerButton}
            >
              <AntDesign name="heart" size={20} color="#EF4444" />
            </TouchableOpacity>

            {/* GIỎ HÀNG */}
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

      {/* 🌟 DANH SÁCH VOUCHER KHUYẾN MÃI (CHẠY NGANG KIỂU SHOPEEFOOD) */}
      <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Ưu đãi độc quyền cho sếp 👇
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
        >
          {vouchers.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.voucherCard}
              onPress={() =>
                Alert.alert(
                  "Nhận Voucher",
                  `Đã copy mã: ${item.code} vào bộ nhớ tạm!`,
                )
              }
            >
              <View style={styles.voucherLeft}>
                <Text style={styles.voucherTag}>MÃ</Text>
              </View>
              <View style={styles.voucherRight}>
                <Text style={styles.voucherCode}>{item.code}</Text>
                <Text style={styles.voucherDesc}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CONTENT DANH SÁCH MÓN ĂN */}
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    overflow: "hidden",
    minWidth: 200,
    elevation: 2,
  },
  voucherLeft: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  voucherTag: { color: "#fff", fontWeight: "900", fontSize: 11 },
  voucherRight: { padding: 8, justifyContent: "center" },
  voucherCode: { fontSize: 13, fontWeight: "700", color: "#111827" },
  voucherDesc: { fontSize: 11, color: "#6B7280", marginTop: 2 },
});

export default Home;
