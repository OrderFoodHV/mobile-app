import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const ShipperPersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.account);

  // Hàm giả lập bấm vào để đổi ảnh đại diện
  const handleUploadPhoto = () => {
    console.log("Mở thư viện ảnh hoặc camera để chụp hình...");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cá nhân</Text>
      </View>

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* THÔNG TIN TÀI XẾ & PHƯƠNG TIỆN */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              {/* KHU VỰC UP ẢNH ĐẠI DIỆN */}
              <TouchableOpacity
                onPress={handleUploadPhoto}
                style={styles.avatarContainer}
              >
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      borderWidth: 2,
                      borderColor: "#F97316",
                    }}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={32} color="#F97316" />
                  </View>
                )}

                <View style={styles.cameraIcon}>
                  <Feather name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <Text style={styles.nameText}>
                  {user?.name || "Tài xế InOrder"}
                </Text>
                <View style={styles.ratingBox}>
                  <Text style={styles.roleBadge}>Đối tác giao hàng</Text>
                  <View style={styles.starWrap}>
                    <Feather name="star" size={14} color="#F59E0B" />
                    <Text style={styles.starText}> 5.0</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Chi tiết xe & liên hệ */}
            <View style={styles.detailRow}>
              <Feather name="phone" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {user?.phone || "0987.654.321"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="motorbike"
                size={18}
                color="#6B7280"
              />
              <Text style={styles.detailText}>
                {user?.vehicle || "Honda Wave Alpha"} •{" "}
                <Text style={{ fontWeight: "bold", color: "#1F2937" }}>
                  {user?.license_plate || "29H1-123.45"}
                </Text>
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Tiện ích tài xế</Text>
          <View style={styles.menuContainer}>
            {/* 🌟 NÚT CÀI ĐẶT -> CHUYỂN SANG TRANG SETTINGS */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("ShipperSettings")}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#F3F4F6" }]}
                >
                  <Feather name="settings" size={20} color="#4B5563" />
                </View>
                <Text style={styles.menuText}>Cài đặt tài khoản</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Chuyển đổi tài khoản</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("BottomContainer")}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#D1FAE5" }]}
                >
                  <Feather name="user" size={20} color="#10B981" />
                </View>
                <Text style={[styles.menuText, { fontWeight: "bold" }]}>
                  Chuyển sang Khách hàng
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#10B981" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                if (Number(user?.is_seller) === 1) {
                  navigation.navigate("StoreBottomContainer");
                } else if (user?.storeStatus === "pending") {
                  Alert.alert(
                    "Thông báo",
                    "Yêu cầu mở cửa hàng của bạn đang chờ Admin phê duyệt. Vui lòng quay lại sau!"
                  );
                } else {
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
              }}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}
                >
                  <Feather name="home" size={20} color="#3B82F6" />
                </View>
                <Text style={[styles.menuText, { fontWeight: "bold" }]}>
                  Chuyển sang Cửa hàng
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: "#ffffff", fontSize: 26, fontWeight: "bold" },
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  profileHeader: { flexDirection: "row", alignItems: "center" },

  // Style cho Avatar up ảnh
  avatarContainer: { position: "relative", marginRight: 16 },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F97316",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#F97316",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  infoBox: { flex: 1 },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roleBadge: { fontSize: 14, color: "#F97316", fontWeight: "600" },
  starWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  starText: { fontWeight: "bold", color: "#D97706", fontSize: 12 },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 15 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  detailText: { marginLeft: 10, fontSize: 15, color: "#4B5563", flex: 1 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6B7280",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingHorizontal: 16,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: { fontSize: 15, color: "#374151", fontWeight: "500" },
});
export default ShipperPersonal;
