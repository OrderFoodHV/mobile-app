import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";

// Đảm bảo đường dẫn đến RootState khớp với project của sếp
import { RootState } from "../../../src/redux/store";
import HeaderApp from "../../../src/app-components/HeaderApp/HeaderApp";
import { Container } from "../../../src/app-layout/Layout";
import colors from "../../../src/assets/colors/global_colors";

const StorePersonal: React.FC = () => {
  const navigation = useNavigation<any>();

  // 🌟 LẤY DATA USER THẬT TỪ REDUX
  const { user } = useSelector((state: RootState) => state.auth, shallowEqual);

  return (
    <Container style={{ backgroundColor: "#F3F4F6" }}>
      <HeaderApp title="Kênh Cửa Hàng" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={36} color={colors.blue_primary} />
          </View>
          <View style={styles.infoBox}>
            {/* 🌟 ĐỔI THÀNH TÊN THẬT CỦA TÀI KHOẢN ĐANG ĐĂNG NHẬP */}
            <Text style={styles.nameText}>{user?.name || "Chủ cửa hàng"}</Text>
            <Text style={styles.roleBadge}>{user?.phone || "Merchant"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Hệ thống chung</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("StoreVouchers")}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#FCE7F3" }]}>
                <Ionicons name="ticket-outline" size={20} color="#DB2777" />
              </View>
              <Text style={styles.menuText}>Mã giảm giá (Vouchers)</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { borderBottomWidth: 0, backgroundColor: "#EFF6FF" },
            ]}
            onPress={() => navigation.navigate("BottomContainer")} // Văng về menu đáy của khách
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: colors.blue_primary },
                ]}
              >
                <Feather name="arrow-left" size={20} color="#fff" />
              </View>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.blue_primary, fontWeight: "bold" },
                ]}
              >
                Quay lại trang Khách hàng
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={colors.blue_primary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoBox: { flex: 1 },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  roleBadge: { fontSize: 13, color: colors.blue_primary, fontWeight: "500" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6B7280",
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
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
    backgroundColor: "#fff",
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
