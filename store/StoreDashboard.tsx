import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // 🌟 THÊM IMPORT NÀY
import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { Container } from "../src/app-layout/Layout";
import colors from "../src/assets/colors/global_colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";

const StoreDashboard = () => {
  const navigation = useNavigation<any>(); // 🌟 KHAI BÁO CÂY GẬY ĐIỀU HƯỚNG

  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const [storeId, setStoreId] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
  });

  const fetchDashboardData = async () => {
    if (!tokenData) return;
    setLoading(true);
    try {
      const statusRes = await useCallAPI({
        method: "GET",
        url: `${URL_API}/api/store/${storeId}/status`,
        token: tokenData,
      });
      if (statusRes && statusRes.data) {
        setIsOpen(statusRes.data.is_open === 1);
      }

      const revenueRes = await useCallAPI({
        method: "GET",
        url: `${URL_API}/api/store/${storeId}/revenue/summary?period=day`,
        token: tokenData,
      });
      if (revenueRes && revenueRes.data) {
        setSummary(revenueRes.data);
      }
    } catch (error) {
      console.log("Lỗi lấy data Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tokenData]);

  const toggleStoreStatus = async () => {
    setIsOpen((previousState) => !previousState);
    try {
      await useCallAPI({
        method: "PUT",
        url: `${URL_API}/api/store/${storeId}/status/toggle`,
        token: tokenData,
      });
    } catch (error) {
      console.log("Lỗi đổi trạng thái quán:", error);
      setIsOpen((previousState) => !previousState);
    }
  };

  return (
    <Container style={{ backgroundColor: "#F3F4F6" }}>
      <HeaderApp title="Tổng quan Cửa hàng" />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.blue_primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* KHỐI 1: CÔNG TẮC */}
          <View style={styles.statusCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isOpen ? "#10B981" : "#EF4444" },
                ]}
              />
              <Text style={styles.statusTitle}>
                {isOpen ? "Quán Đang Mở Cửa" : "Quán Đang Đóng Cửa"}
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
              thumbColor={isOpen ? "#10B981" : "#f4f3f4"}
              onValueChange={toggleStoreStatus}
              value={isOpen}
            />
          </View>

          {/* KHỐI 2: DOANH THU */}
          <Text style={styles.sectionTitle}>Kết quả hôm nay</Text>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <View>
                <Text style={styles.revenueLabel}>Doanh thu tạm tính</Text>
                <Text style={styles.revenueValue}>
                  {Number(summary.total_revenue).toLocaleString("vi-VN")} đ
                </Text>
              </View>
              <View style={styles.iconWrap}>
                <Feather name="dollar-sign" size={24} color="#10B981" />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{summary.total_orders}</Text>
                <Text style={styles.statText}>Tổng đơn</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  {
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderColor: "#F3F4F6",
                  },
                ]}
              >
                <Text
                  style={[styles.statNumber, { color: colors.blue_primary }]}
                >
                  {summary.completed_orders}
                </Text>
                <Text style={styles.statText}>Thành công</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: "#EF4444" }]}>
                  {summary.cancelled_orders}
                </Text>
                <Text style={styles.statText}>Đã hủy</Text>
              </View>
            </View>
          </View>

          {/* KHỐI 3: MENU ĐIỀU HƯỚNG */}
          <Text style={styles.sectionTitle}>Quản lý cửa hàng</Text>
          <View style={styles.menuGrid}>
            {/* 🌟 ĐÃ GẮN SỰ KIỆN CHUYỂN TRANG VÀO NÚT NÀY */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("StoreProducts")}
            >
              <Feather name="list" size={28} color={colors.blue_primary} />
              <Text style={styles.menuText}>Thực đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="ticket-outline" size={28} color="#F59E0B" />
              <Text style={styles.menuText}>Khuyến mãi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Feather name="bar-chart-2" size={28} color="#8B5CF6" />
              <Text style={styles.menuText}>Báo cáo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  statusTitle: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
    marginBottom: 12,
    marginLeft: 4,
  },
  revenueCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  revenueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
    marginBottom: 16,
  },
  revenueLabel: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  revenueValue: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { flex: 1, alignItems: "center" },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statText: { fontSize: 13, color: "#6B7280" },
  menuGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  menuItem: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
  menuText: { marginTop: 8, fontSize: 13, fontWeight: "500", color: "#374151" },
});

export default StoreDashboard;
