import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const StorePersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.account);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cá nhân</Text>
      </View>

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* THÔNG TIN CHỦ QUÁN & CỬA HÀNG */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}>
                <Feather name="home" size={32} color="#F97316" />
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.nameText}>
                  {user?.storeName || user?.name || "Cửa hàng InOrder"}
                </Text>
                <Text style={styles.roleBadge}>Đối tác Nhà hàng</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Chi tiết thông tin */}
            <View style={styles.detailRow}>
              <Feather name="phone" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {user?.phone || "Chưa cập nhật SĐT"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={16} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={2}>
                {user?.storeAddress || user?.address || "55 Giải Phóng, Hai Bà Trưng, Hà Nội"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Tiện ích cửa hàng</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("StoreVouchers")}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#FCE7F3" }]}
                >
                  <Ionicons name="ticket-outline" size={20} color="#DB2777" />
                </View>
                <Text style={styles.menuText}>Mã giảm giá (Vouchers)</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* 🌟 NÚT CÀI ĐẶT -> CHUYỂN SANG TRANG SETTINGS */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("StoreSettings")}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#E0E7FF" }]}
                >
                  <Feather name="settings" size={20} color="#4F46E5" />
                </View>
                <Text style={styles.menuText}>Cài đặt cửa hàng</Text>
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
              onPress={() => navigation.navigate("ShipperBottomContainer")}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#FFEDD5" }]}
                >
                  <Feather name="truck" size={20} color="#F97316" />
                </View>
                <Text style={[styles.menuText, { fontWeight: "bold" }]}>
                  Chuyển sang Tài xế
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#F97316" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#F97316",
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  profileHeader: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoBox: { flex: 1 },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  roleBadge: { fontSize: 14, color: "#F97316", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 15 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
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
export default StorePersonal;
