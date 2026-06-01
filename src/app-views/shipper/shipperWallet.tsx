import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import useCallAPI from "@app-helper/useCallAPI"; // Đảm bảo sếp có import này
import URL_API from "@app-helper/urlAPI";

const ShipperWallet = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Các state lưu dữ liệu thật từ Backend
  const [balance, setBalance] = useState(0);
  const [todayEarn, setTodayEarn] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Hàm "Ăn chắc": Kéo dữ liệu từ Backend
  const fetchWalletData = async () => {
    // Gọi API lấy thống kê ví tài xế (Sếp nhớ đảm bảo BE có route này)
    const res = await useCallAPI({
      method: "GET",
      url: `${URL_API}/shippers/wallet`, // Route ví dụ, sếp chỉnh lại cho khớp BE nhé
      showToast: false,
    });

    if (res?.success && res?.data) {
      setBalance(res.data.balance || 0);
      setTodayEarn(res.data.todayEarn || 0);
      setTodayOrders(res.data.todayOrders || 0);
      setTransactions(res.data.history || []);
    }
    setLoading(false);
  };

  // Chạy ngay khi vừa mở màn hình
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Chạy khi sếp lấy tay vuốt màn hình xuống để tải lại
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  }, []);

  const renderTransaction = ({ item }: { item: any }) => {
    const isEarn = item.type === "earn";
    return (
      <View style={styles.transItem}>
        <View
          style={[
            styles.transIconBox,
            { backgroundColor: isEarn ? "#D1FAE5" : "#FEE2E2" },
          ]}
        >
          <Feather
            name={isEarn ? "arrow-down-left" : "arrow-up-right"}
            size={20}
            color={isEarn ? "#10B981" : "#EF4444"}
          />
        </View>
        <View style={styles.transInfo}>
          <Text style={styles.transTitle} numberOfLines={1}>
            {item.title || item.description}
          </Text>
          {/* Tuỳ format ngày giờ từ BE trả về, sếp có thể dùng moment.js hoặc format chuẩn */}
          <Text style={styles.transTime}>
            {item.time || new Date(item.created_at).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <View style={styles.transAmountBox}>
          <Text
            style={[
              styles.transAmount,
              { color: isEarn ? "#10B981" : "#1F2937" },
            ]}
          >
            {isEarn ? "+" : ""}
            {Number(item.amount || item.points || 0).toLocaleString("vi-VN")}đ
          </Text>
          {item.status === "pending" && (
            <Text style={styles.statusPending}>Đang xử lý</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Đang tải dữ liệu ví...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thu nhập của bạn</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#F97316"]}
          />
        }
        ListEmptyComponent={() => (
          <View style={{ padding: 30, alignItems: "center" }}>
            <Feather name="inbox" size={40} color="#D1D5DB" />
            <Text style={{ color: "#6B7280", marginTop: 10 }}>
              Chưa có lịch sử giao dịch nào
            </Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Text style={styles.walletLabel}>Số dư khả dụng</Text>
                <Feather name="info" size={16} color="#FFEDD5" />
              </View>
              <Text style={styles.walletBalance}>
                {balance.toLocaleString("vi-VN")}đ
              </Text>

              <View style={styles.walletActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Feather name="credit-card" size={20} color="#fff" />
                  <Text style={styles.actionText}>Rút tiền</Text>
                </TouchableOpacity>
                <View style={styles.dividerVertical} />
                <TouchableOpacity style={styles.actionBtn}>
                  <Feather name="pie-chart" size={20} color="#fff" />
                  <Text style={styles.actionText}>Thống kê</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quickStats}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {todayEarn.toLocaleString("vi-VN")}đ
                </Text>
                <Text style={styles.statLabel}>Hôm nay</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{todayOrders}</Text>
                <Text style={styles.statLabel}>Đơn hoàn thành</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
            </View>
          </>
        )}
        renderItem={renderTransaction}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  walletCard: {
    backgroundColor: "#F97316",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  walletLabel: { color: "#FFEDD5", fontSize: 14, fontWeight: "500" },
  walletBalance: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingTop: 15,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  actionText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  dividerVertical: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: { fontSize: 13, color: "#6B7280" },
  statDivider: { width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#374151" },
  transItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
  },
  transIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transInfo: { flex: 1 },
  transTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  transTime: { fontSize: 13, color: "#6B7280" },
  transAmountBox: { alignItems: "flex-end" },
  transAmount: { fontSize: 16, fontWeight: "bold" },
  statusPending: {
    fontSize: 12,
    color: "#F59E0B",
    marginTop: 4,
    fontWeight: "500",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default ShipperWallet;
