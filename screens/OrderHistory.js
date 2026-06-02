import { useFocusEffect } from "@react-navigation/native"; // Thêm dòng này để trị bệnh lười load data
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../api/api";

export default function OrderHistory({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dùng useFocusEffect thay cho useEffect để mỗi lần màn hình hiện lên là gọi lại API
  useFocusEffect(
    useCallback(() => {
      setLoading(true); // Bật loading mỗi khi quay lại màn hình này
      // Tạo một cái mã thời gian ngẫu nhiên để chống Cache 100%
      const timeNow = new Date().getTime();

      API.get("/orders?user_id=3", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
        .then((res) => {
          // Mock API trả về mảng, ta đảo ngược (reverse) để đơn mới nhất lên đầu
          setOrders(res.data.reverse());
          setLoading(false);
        })
        .catch((err) => {
          console.log("Lỗi tải lịch sử đơn hàng:", err);
          setLoading(false);
        });
    }, []),
  );

  // Hàm tạo màu nền cho từng trạng thái đơn hàng
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { bg: "#FFF4E5", text: "#FF9800" }; // Chờ xử lý
      case "delivering":
        return { bg: "#E3F2FD", text: "#2196F3" }; // Đang giao
      case "completed":
        return { bg: "#E8F5E9", text: "#4CAF50" }; // Đã giao
      case "cancelled":
        return { bg: "#FFEBEE", text: "#F44336" }; // Đã hủy
      default:
        return { bg: "#F5F5F5", text: "#757575" };
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FF6C22" style={{ flex: 1 }} />
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Lịch sử đơn hàng 📋</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào!</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) =>
            item?.id?.toString() || Math.random().toString()
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusStyle.text }]}
                    >
                      {item.status || "Chưa rõ"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.priceText}>
                  Tổng tiền:{" "}
                  <Text style={styles.priceHighlight}>
                    {(item.total_price || 0).toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Text>

                {/* Chuyển hướng sang màn OrderDetail vừa tạo */}
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() =>
                    navigation.navigate("OrderDetail", { orderId: item.id })
                  }
                >
                  <Text style={styles.trackButtonText}>
                    📍 Xem chi tiết & Lộ trình
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingHorizontal: 15 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 15,
  },
  emptyView: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: { fontSize: 16, fontWeight: "bold", color: "#333" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  priceText: { fontSize: 14, color: "#555", marginBottom: 15 },
  priceHighlight: { fontSize: 16, color: "#FF6C22", fontWeight: "bold" },
  trackButton: {
    backgroundColor: "#FFF3ED",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6C22",
  },
  trackButtonText: { color: "#FF6C22", fontWeight: "bold", fontSize: 14 },
});
