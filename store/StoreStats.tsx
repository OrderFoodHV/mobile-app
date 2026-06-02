import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../src/assets/colors/global_colors";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";
import { useSelector } from "react-redux";
import StoreOrdersModal from "./StoreOrdersModal";

const StoreStats = () => {
  const user = useSelector((state: any) => state.auth.account);
  const token = useSelector((state: any) => state.auth.tokenData);
  const storeId = user?.storeId || 1;
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    total_orders: 0,
    successful_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
  });

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStatus, setModalStatus] = useState<"all" | "completed" | "cancelled">("all");

  const fetchStoreDashboardData = async () => {
    setLoading(true);
    try {
      // 🚀 Gọi API lấy dữ liệu báo cáo tổng quan của Kênh người bán
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/dashboard-summary`,
        token: token,
      });
      if (res && !res.error) {
        setSummary(
          res.data || res,
        );
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreDashboardData();
  }, []);

  return (
    <View style={styles.container}>
      {/* THANH TIÊU ĐỀ */}


      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.blue_primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* TAB 1: THIẾT KẾ ĐÚNG 4 Ô THÔNG SỐ CHÍNH ĐỐI SOÁT KINH DOANH TRỰC QUAN */}
            <View>
              <Text style={styles.titleText}>Kết quả kinh doanh tháng này</Text>

              <View style={styles.gridContainer}>
                {/* Ô 1: DOANH THU THUẦN */}
                <View
                  style={[
                    styles.gridCard,
                    { borderLeftColor: "#10B981", borderLeftWidth: 4 },
                  ]}
                >
                  <Feather name="dollar-sign" size={20} color="#10B981" />
                  <Text style={styles.cardLabel}>Doanh thu thuần</Text>
                  <Text style={styles.cardValue}>
                    {Number(summary.total_revenue || 0).toLocaleString()}đ
                  </Text>
                </View>

                {/* Ô 2: TỔNG ĐƠN ĐÃ NHẬN */}
                <TouchableOpacity
                  style={[
                    styles.gridCard,
                    {
                      borderLeftColor: colors.blue_primary,
                      borderLeftWidth: 4,
                    },
                  ]}
                  onPress={() => { setModalStatus("all"); setModalVisible(true); }}
                >
                  <Feather
                    name="shopping-cart"
                    size={20}
                    color={colors.blue_primary}
                  />
                  <Text style={styles.cardLabel}>Tổng đơn đã nhận</Text>
                  <Text style={styles.cardValue}>{summary.total_orders || 0} đơn</Text>
                </TouchableOpacity>

                {/* Ô 3: ĐƠN GIAO THÀNH CÔNG */}
                <TouchableOpacity
                  style={[
                    styles.gridCard,
                    { borderLeftColor: "#3B82F6", borderLeftWidth: 4 },
                  ]}
                  onPress={() => { setModalStatus("completed"); setModalVisible(true); }}
                >
                  <Feather name="check-circle" size={20} color="#3B82F6" />
                  <Text style={styles.cardLabel}>Giao thành công</Text>
                  <Text style={styles.cardValue}>
                    {summary.successful_orders || 0} đơn
                  </Text>
                </TouchableOpacity>

                {/* Ô 4: ĐƠN BỊ HỦY */}
                <TouchableOpacity
                  style={[
                    styles.gridCard,
                    { borderLeftColor: "#EF4444", borderLeftWidth: 4 },
                  ]}
                  onPress={() => { setModalStatus("cancelled"); setModalVisible(true); }}
                >
                  <Feather name="x-circle" size={20} color="#EF4444" />
                  <Text style={styles.cardLabel}>Đơn hàng đã hủy</Text>
                  <Text style={styles.cardValue}>
                    {summary.cancelled_orders || 0} đơn
                  </Text>
                </TouchableOpacity>
              </View>

              <StoreOrdersModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                storeId={storeId}
                token={token}
                statusType={modalStatus}
              />
            </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  topMenu: { flexDirection: "row", backgroundColor: "#fff", elevation: 2 },
  menuItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  menuActive: { borderBottomColor: colors.blue_primary },
  menuText: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
  menuTextActive: { color: colors.blue_primary },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridCard: {
    backgroundColor: "#fff",
    width: "48%",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    gap: 4,
  },
  cardLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },
  voucherHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addVoucherBtn: {
    backgroundColor: colors.blue_primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  vCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  vCode: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  vDesc: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  statusToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

export default StoreStats;
