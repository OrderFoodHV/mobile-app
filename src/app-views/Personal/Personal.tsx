import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { resetAllAuth, updateAuthInfor } from "src/redux/features/authSlice";
import { RootState } from "../../redux/store";
import colors from "@assets/colors/global_colors";
import { useNavigationServices } from "@app-helper/navigateToScreens";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";

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

  // Tự động tải lại hồ sơ khi vào màn hình thông tin cá nhân
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const fetchProfile = async () => {
        const token = authState?.tokenData;
        if (!token) return;
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/users/me`,
          token: token,
          showToast: false,
        });
        if (isMounted) {
          if (res && (res.status === 401 || res.success === false)) {
            dispatch(resetAllAuth());
            navigation.replace("Login");
          } else if (res && res.success !== false) {
            const profile = res;
            let vehicleModel = profile.vehicle || "";
            let licensePlate = "";
            if (profile.vehicle && profile.vehicle.includes(",")) {
              const parts = profile.vehicle.split(",");
              vehicleModel = parts[0].trim();
              licensePlate = parts[1].trim();
            }
            dispatch(
              updateAuthInfor({
                is_shipper: profile.is_shipper,
                is_seller: profile.is_seller,
                shipperStatus: profile.shipperStatus,
                storeStatus: profile.storeStatus,
                storeId: profile.storeId,
                storeName: profile.storeName,
                storeAddress: profile.storeAddress,
                storePhone: profile.storePhone,
                phone: profile.phone,
                user_name: profile.name || profile.user_name,
                vehicle: vehicleModel,
                license_plate: licensePlate,
                shipperPhone: profile.shipperPhone,
              })
            );
          }
        }
      };
      fetchProfile();
      return () => {
        isMounted = false;
      };
    }, [authState?.tokenData])
  );

  // 🔥 ĐỒNG BỘ LUỒNG DỮ LIỆU MỚI: Bốc chuẩn từ authState.account theo authSlice mới
  const account = authState?.account;
  const displayName = account?.user_name || "Khách hàng HUCE";
  const displayPhone = account?.phone || "Chưa cập nhật SĐT";
  const handleGoToShipper = async () => {
    if (!account)
      return Alert.alert("Thông báo", "Vui lòng đăng nhập!");

    const token = authState?.tokenData;
    if (!token) return;

    // Lấy thông tin mới nhất từ máy chủ ngay khi bấm vào nút
    const res = await useCallAPI({
      method: "GET",
      url: `${URL_API}/users/me`,
      token: token,
      showToast: false,
    });

    let currentIsShipper = Number(account?.is_shipper) === 1;
    let currentShipperStatus = account?.shipperStatus;

    if (res && res.success !== false) {
      const profile = res;
      let vehicleModel = profile.vehicle || "";
      let licensePlate = "";
      if (profile.vehicle && profile.vehicle.includes(",")) {
        const parts = profile.vehicle.split(",");
        vehicleModel = parts[0].trim();
        licensePlate = parts[1].trim();
      }
      dispatch(
        updateAuthInfor({
          is_shipper: profile.is_shipper,
          is_seller: profile.is_seller,
          shipperStatus: profile.shipperStatus,
          storeStatus: profile.storeStatus,
          phone: profile.phone,
          user_name: profile.name || profile.user_name,
          vehicle: vehicleModel,
          license_plate: licensePlate,
          shipperPhone: profile.shipperPhone,
        })
      );
      currentIsShipper = Number(profile.is_shipper) === 1;
      currentShipperStatus = profile.shipperStatus;
    }

    if (currentIsShipper) {
      // Đã đăng ký & được duyệt -> Bay thẳng vào màn chính Shipper
      navigation.navigate("ShipperBottomContainer");
    } else if (currentShipperStatus === "blocked") {
      // Bị khóa -> Cho vào để thông báo khóa
      navigation.navigate("ShipperBottomContainer");
    } else if (currentShipperStatus === "pending") {
      Alert.alert(
        "Thông báo",
        "Yêu cầu làm tài xế của bạn đang chờ Admin phê duyệt. Vui lòng quay lại sau!"
      );
    } else {
      // Chưa đăng ký hoặc bị xóa -> Vào màn Đăng ký để đăng ký lại
      navigation.navigate("ShipperLanding");
    }
  };

  const handleGoToSeller = async () => {
    if (!account) {
      Alert.alert("Thông báo", "Bạn chưa đăng nhập!");
      return;
    }

    const token = authState?.tokenData;
    if (!token) return;

    // Lấy thông tin mới nhất từ máy chủ ngay khi bấm vào nút
    const res = await useCallAPI({
      method: "GET",
      url: `${URL_API}/users/me`,
      token: token,
      showToast: false,
    });

    let currentIsSeller = Number(account?.is_seller) === 1;
    let currentStoreStatus = account?.storeStatus;

    if (res && res.success !== false) {
      const profile = res;
      dispatch(
        updateAuthInfor({
          is_shipper: profile.is_shipper,
          is_seller: profile.is_seller,
          shipperStatus: profile.shipperStatus,
          storeStatus: profile.storeStatus,
          storeId: profile.storeId,
          storeName: profile.storeName,
          storeAddress: profile.storeAddress,
          storePhone: profile.storePhone,
          phone: profile.phone,
          user_name: profile.name || profile.user_name,
        })
      );
      currentIsSeller = Number(profile.is_seller) === 1;
      currentStoreStatus = profile.storeStatus;
    }

    if (currentIsSeller) {
      navigation.navigate("StoreBottomContainer");
    } else if (currentStoreStatus === "pending") {
      Alert.alert(
        "Thông báo",
        "Yêu cầu mở cửa hàng của bạn đang chờ Admin phê duyệt. Vui lòng quay lại sau!"
      );
    } else {
      // bạn đổi từ Alert sang chuyển hướng đến màn Đăng ký mở quán
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerBlue: {
    backgroundColor: colors.blue_primary || "#3498db",
    height: 90,
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
