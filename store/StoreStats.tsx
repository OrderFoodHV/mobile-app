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
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../src/assets/colors/global_colors";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";
import { useSelector } from "react-redux";

const StoreStats = () => {
  const token = useSelector((state: any) => state.auth.tokenData);
  const storeId = useSelector((state: any) => state.auth.account?.storeId) || 1;
  const [currentSubTab, setCurrentSubTab] = useState("dashboard"); // "dashboard" | "vouchers"
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    revenue: 0,
    total: 0,
    success: 0,
    cancelled: 0,
  });
  const [vouchers, setVouchers] = useState([
    {
      code: "INORDERNEW",
      discount: 15000,
      desc: "Giảm 15k cho đơn hàng mới",
      active: 1,
    },
    {
      code: "ANSANG",
      discount: 10000,
      desc: "Ưu đãi ăn sáng đồng giá",
      active: 0,
    },
  ]);

  const fetchStoreDashboardData = async () => {
    setLoading(true);
    try {
      // 🚀 Gọi API lấy dữ liệu báo cáo tổng quan của Kênh người bán
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/dashboard-summary`,
        token: token,
      });
      if (res) {
        const actualSummary = res.data || res;
        setSummary(
          actualSummary && actualSummary.revenue !== undefined
            ? actualSummary
            : { revenue: 0, total: 0, success: 0, cancelled: 0 }
        );
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSubTab === "dashboard") fetchStoreDashboardData();
  }, [currentSubTab, storeId, token]);

  return (
    <View style={styles.container}>
      {/* THANH MENU CHUYỂN MODULE KÊNH NGƯỜI BÁN */}
      <View style={styles.topMenu}>
        <TouchableOpacity
          style={[
            styles.menuItem,
            currentSubTab === "dashboard" && styles.menuActive,
          ]}
          onPress={() => setCurrentSubTab("dashboard")}
        >
          <Text
            style={[
              styles.menuText,
              currentSubTab === "dashboard" && styles.menuTextActive,
            ]}
          >
            Báo Cáo Doanh Thu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuItem,
            currentSubTab === "vouchers" && styles.menuActive,
          ]}
          onPress={() => setCurrentSubTab("vouchers")}
        >
          <Text
            style={[
              styles.menuText,
              currentSubTab === "vouchers" && styles.menuTextActive,
            ]}
          >
            Mã Khuyến Mãi
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.blue_primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* TAB 1: THIẾT KẾ ĐÚNG 4 Ô THÔNG SỐ CHÍNH ĐỐI SOÁT KINH DOANH TRỰC QUAN */}
          {currentSubTab === "dashboard" && (
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
                    {Number(summary.revenue || 0).toLocaleString()}đ
                  </Text>
                </View>

                {/* Ô 2: TỔNG ĐƠN ĐÃ NHẬN */}
                <View
                  style={[
                    styles.gridCard,
                    {
                      borderLeftColor: colors.blue_primary,
                      borderLeftWidth: 4,
                    },
                  ]}
                >
                  <Feather
                    name="shopping-cart"
                    size={20}
                    color={colors.blue_primary}
                  />
                  <Text style={styles.cardLabel}>Tổng đơn đã nhận</Text>
                  <Text style={styles.cardValue}>{summary.total || 0} đơn</Text>
                </View>

                {/* Ô 3: ĐƠN GIAO THÀNH CÔNG */}
                <View
                  style={[
                    styles.gridCard,
                    { borderLeftColor: "#3B82F6", borderLeftWidth: 4 },
                  ]}
                >
                  <Feather name="check-circle" size={20} color="#3B82F6" />
                  <Text style={styles.cardLabel}>Giao thành công</Text>
                  <Text style={styles.cardValue}>
                    {summary.success || 0} đơn
                  </Text>
                </View>

                {/* Ô 4: ĐƠN BỊ HỦY */}
                <View
                  style={[
                    styles.gridCard,
                    { borderLeftColor: "#EF4444", borderLeftWidth: 4 },
                  ]}
                >
                  <Feather name="x-circle" size={20} color="#EF4444" />
                  <Text style={styles.cardLabel}>Đơn hàng đã hủy</Text>
                  <Text style={styles.cardValue}>
                    {summary.cancelled || 0} đơn
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: QUẢN LÝ KÍCH HOẠT / TẮT VOUCHER KHUYẾN MÃI THỜI GIAN THỰC */}
          {currentSubTab === "vouchers" && (
            <View>
              <View style={styles.voucherHeaderRow}>
                <Text style={styles.titleText}>Khuyến mãi của cửa hàng</Text>
                <TouchableOpacity
                  style={styles.addVoucherBtn}
                  onPress={() =>
                    Alert.alert("Tính năng", "Mở Form tạo mã Voucher mới!")
                  }
                >
                  <Text style={styles.addText}>+ Tạo mã</Text>
                </TouchableOpacity>
              </View>

              {vouchers.map((item, idx) => (
                <View key={idx} style={styles.vCard}>
                  <MaterialCommunityIcons
                    name="ticket-percent"
                    size={32}
                    color={item.active ? colors.blue_primary : "#9CA3AF"}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.vCode}>{item.code}</Text>
                    <Text style={styles.vDesc}>{item.desc}</Text>
                  </View>

                  {/* Nút bật tắt kích hoạt trạng thái voucher */}
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      { backgroundColor: item.active ? "#D1FAE5" : "#F3F4F6" },
                    ]}
                    onPress={() => {
                      const updated = [...vouchers];
                      updated[idx].active = updated[idx].active ? 0 : 1;
                      setVouchers(updated);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: item.active ? "#065F46" : "#4B5563",
                        fontWeight: "bold",
                      }}
                    >
                      {item.active ? "Đang chạy" : "Tạm dừng"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
