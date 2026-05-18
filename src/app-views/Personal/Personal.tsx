import { useNavigation } from "@react-navigation/native";
import React, { Fragment, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Container, Content } from "@app-layout/Layout";
import { Ionicons } from "@expo/vector-icons";
import AppImage from "@app-uikits/AppImage";
import colors from "@assets/colors/global_colors";
import {
  useNavigationComponentApp,
  useNavigationServices,
} from "@app-helper/navigateToScreens";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { resetAllAuth } from "@redux/features/authSlice";
import { resetAllCart } from "@redux/features/cartSlice";
import { resetAllOrderData } from "@redux/features/orderSlice";
import { resetAllProductListData } from "@redux/features/productListSlice";
import AppLoading from "@app-components/AppLoading/AppLoading";
import { LOGOAPP } from "@app-uikits/image";
import ServiceStorage from "@app-services/service-storage";
import { useAppTheme } from "src/app-context/ThemeContext";
const Personal = () => {
  const { themeColors } = useAppTheme();
  const { replaceScreen } = useNavigationServices();
  const { goToOrderList, goToCart } = useNavigationComponentApp();
  const navigation = useNavigation<any>();
  const { account } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    await ServiceStorage.clearAll();
    dispatch(resetAllAuth());
    dispatch(resetAllCart());
    dispatch(resetAllOrderData());
    dispatch(resetAllProductListData());
    setLoading(false);
    replaceScreen("Login");
  };
  const menuOptions = [
    {
      id: "1",
      icon: "person-outline",
      title: "Thông tin tài khoản",
      press: () => navigation.navigate("ProfileDetail"),
    },
    {
      id: "2",
      icon: "receipt-outline",
      title: "Đơn hàng",
      press: () => goToOrderList({ trigger: true }),
    },
    {
      id: "3",
      icon: "cart-outline",
      title: "Giỏ hàng",
      press: () => goToCart(),
    },
    {
      id: "4",
      icon: "location-outline",
      title: "Địa chỉ",
      press: () => navigation.navigate("AddressScreen"),
    },
    {
      id: "5",
      icon: "settings-outline",
      title: "Cài đặt",
      press: () => navigation.navigate("SettingsScreen"),
    },
    {
      id: "6",
      icon: "log-out-outline",
      title: "Đăng xuất",
      press: () => onLogout(),
    },
  ];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.press}>
      <View style={styles.left}>
        <Ionicons name={item.icon} size={20} color={colors.blue_primary} />
        <Text style={styles.menuText}>{item.title}</Text>
      </View>

      <Ionicons name="chevron-forward-outline" size={18} color="#999" />
    </TouchableOpacity>
  );

  return (
    <Container style={{ backgroundColor: themeColors.bg }}>
      <Content>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <AppImage source={LOGOAPP} style={styles.avatar} />
          </View>
          <Text style={styles.username}>{account?.user_name || "User"}</Text>
        </View>

        {/* MENU */}
        <View style={styles.card}>
          <FlatList
            data={menuOptions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Content>

      {loading && <AppLoading loading={loading} />}
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.blue_primary,
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatarWrapper: {
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 50,
    marginBottom: 10,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    paddingVertical: 10,

    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Android
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },

  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 16,
  },
});

export default Personal;
