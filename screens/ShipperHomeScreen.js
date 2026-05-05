import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../api/api";

export default function ShipperHomeScreen({ navigation }) {
  // Giả sử Shipper Tuấn đăng nhập thành công có shipper_id = 1
  const currentShipperId = 1;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "delivering"

  // Load danh sách đơn hàng tùy theo Tab đang chọn
  const loadOrders = () => {
    setLoading(true);
    let url = "";

    if (activeTab === "pending") {
      // Tìm các đơn khách vừa đặt, chưa ai nhận
      url = "/orders?status=pending";
    } else {
      // Tìm các đơn mà CHÍNH TÔI (shipper_id = 1) đang giao
      url = `/orders?shipper_id=${currentShipperId}&status=delivering`;
    }

    API.get(url, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
      .then((res) => {
        setOrders(res.data.reverse()); // Đơn mới nhất xếp lên đầu
        setLoading(false);
      })
      .catch((err) => {
        console.log("Lỗi tải đơn shipper:", err);
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [activeTab]),
  );

  // Hàm xử lý khi Shipper bấm "Nhận đơn này"
  const handleAcceptOrder = async (orderId) => {
    try {
      // Dùng PATCH để cập nhật 2 trường: Trạng thái và Người giao
      await API.patch(`/orders/${orderId}`, {
        status: "delivering",
        shipper_id: currentShipperId,
      });

      Alert.alert("Thành công!", "Đã nhận đơn, lên xe đi giao thôi! 🛵");
      loadOrders(); // Load lại danh sách cho nó biến mất khỏi tab "Đơn mới"
    } catch (error) {
      Alert.alert("Lỗi", "Có ai đó đã giành mất đơn này rồi!");
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Đơn #{item.id}</Text>
        <Text style={styles.priceHighlight}>
          {(item.total_price || 0).toLocaleString()} VNĐ
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>📍 Giao tới: </Text>
        <Text style={styles.value}>{item.address}</Text>
      </View>

      {/* Nút thao tác tùy theo Tab */}
      {activeTab === "pending" ? (
        <TouchableOpacity
          style={styles.btnAccept}
          onPress={() => handleAcceptOrder(item.id)}
        >
          <Text style={styles.btnText}>✋ Nhận đơn này</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.btnDetail}
          // Chuyển sang màn OrderDetail để xem danh sách món hoặc bấm Hoàn thành
          onPress={() =>
            navigation.navigate("OrderDetail", { orderId: item.id })
          }
        >
          <Text style={styles.btnDetailText}>Xem chi tiết để đi giao</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài xế InOrder 🛵</Text>
      </View>

      {/* Tab bar điều hướng */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Đơn mới nổ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "delivering" && styles.activeTab]}
          onPress={() => setActiveTab("delivering")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "delivering" && styles.activeTabText,
            ]}
          >
            Đang giao
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00BA61" style={{ flex: 1 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>
            {activeTab === "pending"
              ? "Hiện tại chưa có đơn hàng nào nổ!"
              : "Bạn đang không giao đơn nào!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#00BA61", // Màu xanh lá đặc trưng cho app Shipper
    padding: 20,
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 15, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#00BA61" },
  tabText: { fontSize: 16, color: "#888", fontWeight: "bold" },
  activeTabText: { color: "#00BA61" },
  emptyView: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 10,
  },
  orderId: { fontSize: 18, fontWeight: "bold", color: "#333" },
  priceHighlight: { fontSize: 18, fontWeight: "bold", color: "#E53935" },
  infoRow: { marginBottom: 15 },
  label: { fontSize: 14, color: "#666", fontWeight: "bold" },
  value: { fontSize: 15, color: "#333", marginTop: 4 },
  btnAccept: {
    backgroundColor: "#00BA61",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  btnDetail: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00BA61",
  },
  btnDetailText: { color: "#00BA61", fontSize: 16, fontWeight: "bold" },
});
