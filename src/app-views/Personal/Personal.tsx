import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { resetAllAuth } from "src/redux/features/authSlice";
import { RootState } from "../../redux/store";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";

const Personal: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  // 🌟 FIX 2: Thêm "as any" để TypeScript hết báo đỏ
  const authState = useSelector(
    (state: RootState) => state.auth as any,
    shallowEqual,
  );

  // Đề phòng data trả về tên khác nhau
  const user = authState?.user || authState?.userInfo || authState?.userData;
  const displayName =
    user?.name || user?.fullName || user?.fullname || user?.data?.name || "An";

  return (
    <Container style={{ backgroundColor: "#F3F4F6" }}>
      {/* 🌟 HEADER MÀU XANH GIỐNG ẢNH SẾP CHỤP */}
      <View style={styles.headerBlue}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={32} color="#fff" />
          </View>
          <Text style={styles.avatarName}>{displayName}</Text>
        </View>
      </View>

      {/* 🌟 ĐÃ XÓA MẶC ĐỊNH MẶC MARGIN TOP BỊ LỖI, GIAO DIỆN HIỆN CHUẨN */}
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

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("StoreBottomContainer")}
          >
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

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => {
              // 1. Gọi hàm resetAllAuth để xóa sạch Token trong Redux
              dispatch(resetAllAuth());

              // 2. Chờ Redux xóa xong trong 0.2 giây rồi đá sang màn Login tĩnh lặng luôn
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
    height: 120, // Độ cao vừa phải
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    position: "relative",
    zIndex: 10,
  },
  avatarContainer: {
    position: "absolute",
    right: 20,
    bottom: 15,
    alignItems: "center",
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
    marginBottom: 5,
  },
  avatarName: { color: "#fff", fontSize: 14, fontWeight: "600" },
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
