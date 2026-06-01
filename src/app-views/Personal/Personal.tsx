// src/app-views/Personal/Personal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { resetAllAuth } from "src/redux/features/authSlice";
import { RootState } from "../../redux/store";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import { useNavigationServices } from "@app-helper/navigateToScreens";
const Personal: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { replaceScreen } = useNavigationServices();
  // Lấy thẳng authState từ Redux Store
  const authState = useSelector(
    (state: RootState) => state.auth as any,
    shallowEqual,
  );
  const user = authState?.user; // Phải lấy ra từ đây
  console.log("Dữ liệu User trong Redux:", user);

  // 🔥 ĐỒNG BỘ LUỒNG DỮ LIỆU MỚI: Bốc chuẩn từ authState.account theo authSlice mới
  const account = authState?.account;
  const displayName = account?.user_name || "Khách hàng HUCE";
  const displayPhone = account?.phone || "Chưa cập nhật SĐT";
  const handleGoToShipper = () => {
    // 1. Check xem đã đăng nhập chưa (check cả user và account cho chắc)
    if (!user && !account)
      return Alert.alert("Thông báo", "Vui lòng đăng nhập!");

    // 2. 🔥 Bắt chính xác cờ is_shipper từ Redux
    const isShipper =
      Number(user?.is_shipper) === 1 || Number(account?.is_shipper) === 1;

    if (isShipper) {
      // Đã đăng ký -> Bay thẳng vào màn chính Shipper
      navigation.navigate("ShipperBottomContainer");
    } else {
      // Chưa đăng ký -> Vào màn Đăng ký (màu cam)
      navigation.navigate("ShipperLanding");
    }
  };

  const handleGoToSeller = () => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn chưa đăng nhập!");
      return;
    }

    if (user?.is_seller === 1) {
      navigation.navigate("StoreBottomContainer");
    } else {
      // Sếp đổi từ Alert sang chuyển hướng đến màn Đăng ký mở quán
      Alert.alert(
        "Thông báo",
        "Bạn chưa là Người bán. Bạn có muốn đăng ký mở cửa hàng?",
        [
          { text: "Để sau", style: "cancel" },
          {
            text: "Đăng ký ngay",
            onPress: () => navigation.navigate("StoreLanding"),
          },
        ],
      );
    }
  };
  return (
    <Container style={{ backgroundColor: "#F3F4F6" }}>
      {/* 🌟 HEADER MÀU XANH HIỂN THỊ THÔNG TIN CHÍNH CHỦ */}
      <View style={styles.headerBlue}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={32} color="#fff" />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            {/* Hiện đúng tên khách đăng ký */}
            <Text style={styles.avatarName}>{displayName}</Text>
            {/* Hiện đúng số điện thoại khách đăng ký dưới tên */}
            <Text style={styles.avatarPhone}>{displayPhone}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("ProfileDetail")}
          >
            <Feather
              name="user"
              size={20}
              color="#0284C7"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Thông tin tài khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("OrderList")}
          >
            <Feather
              name="file-text"
              size={20}
              color="#0284C7"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Cart")}
          >
            <Feather
              name="shopping-cart"
              size={20}
              color="#0284C7"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Giỏ hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("AddressScreen")}
          >
            <Feather
              name="map-pin"
              size={20}
              color="#0284C7"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Địa chỉ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("SettingsScreen")}
          >
            <Feather
              name="settings"
              size={20}
              color="#0284C7"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Cài đặt</Text>
          </TouchableOpacity>

          {/* 🏪 PHÂN QUYỀN THÔNG MINH: Chỉ hiện Kênh Người Bán nếu role là admin */}
          <TouchableOpacity style={styles.menuItem} onPress={handleGoToSeller}>
            <Feather
              name="home"
              size={20}
              color="#F97316"
              style={styles.menuIcon}
            />
            <Text
              style={[
                styles.menuText,
                { color: "#F97316", fontWeight: "bold" },
              ]}
            >
              Kênh Người Bán
            </Text>
          </TouchableOpacity>
          {/* 🛵 KÊNH TÀI XẾ: Thêm vào dưới khối Kênh Người Bán */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleGoToShipper} // Hàm này đã có ở trên rồi
          >
            <Feather
              name="truck"
              size={20}
              color="#3B82F6"
              style={styles.menuIcon}
            />
            <Text
              style={[
                styles.menuText,
                { color: "#3B82F6", fontWeight: "bold" },
              ]}
            >
              Kênh Tài Xế
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => {
              dispatch(resetAllAuth());
              setTimeout(() => {
                navigation.replace("Login");
              }, 200);
            }}
          >
            <Feather
              name="log-out"
              size={20}
              color="#0284C7"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  headerBlue: {
    backgroundColor: colors.blue_primary || "#3498db",
    height: 120,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    position: "relative",
    zIndex: 10,
  },
  avatarContainer: {
    position: "absolute",
    right: 20,
    bottom: 15,
    flexDirection: "row", // Đổi sang hàng ngang nhìn cho sang xịn mịn
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  avatarPhone: {
    color: "#E0F2FE",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  scrollContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  menuContainer: { backgroundColor: "#fff", marginTop: 10 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIcon: { marginRight: 15 },
  menuText: { fontSize: 16, color: "#374151" },
});

export default Personal;
