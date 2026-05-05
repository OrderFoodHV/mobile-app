import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../api/api";

export default function OrderDetailScreen({ route, navigation }) {
  // Nhận orderId từ màn hình Lịch sử (OrderHistory) truyền sang
  const { orderId } = route.params || {};

  const [orderItems, setOrderItems] = useState([]);
  const [tracking, setTracking] = useState([]);
  // 👉 BỔ SUNG STATE ĐỂ LƯU THÔNG TIN ĐƠN HÀNG (CÓ ĐỊA CHỈ)
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        // Cùng lúc gọi 3 API: Món ăn, Lộ trình, và Thông tin gốc của đơn
        const [itemsRes, trackingRes, orderRes] = await Promise.all([
          API.get(`/order_items?order_id=${orderId}`),
          API.get(`/order_tracking?order_id=${orderId}`),
          API.get(`/orders/${orderId}`),
        ]);

        setOrderItems(itemsRes.data);
        // Sắp xếp tracking mới nhất lên đầu
        setTracking(trackingRes.data.reverse());
        // Lưu thông tin đơn (chứa địa chỉ) vào state
        setOrderInfo(orderRes.data);
      } catch (err) {
        console.log("Lỗi tải chi tiết đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Tính lại tổng tiền của đơn hàng
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
    0,
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#FF6C22" style={{ flex: 1 }} />
    );
  }

  if (!orderId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng!</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chi tiết đơn #{orderId}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/*  BỔ SUNG SECTION ĐỊA CHỈ*/}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          <Text style={styles.addressText}>
            {orderInfo?.address || "Đang cập nhật địa chỉ..."}
          </Text>
        </View>

        {/* Section 1: Lộ trình giao hàng (Tracking) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Lộ trình đơn hàng</Text>
          {tracking.length === 0 ? (
            <Text style={styles.trackingText}>
              Chưa có thông tin vận chuyển
            </Text>
          ) : (
            tracking.map((track, index) => (
              <View key={track?.id || index} style={styles.trackingItem}>
                {/* Chấm tròn trạng thái */}
                <View style={[styles.dot, index === 0 && styles.activeDot]} />
                <View style={styles.trackingContent}>
                  <Text
                    style={[
                      styles.trackingStatus,
                      index === 0 && styles.activeText,
                    ]}
                  >
                    Trạng thái: {track?.status?.toUpperCase()}
                  </Text>
                  <Text style={styles.trackingNote}>
                    {track?.note || "Đang cập nhật..."}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Section 2: Danh sách món ăn */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🍔 Danh sách món ăn</Text>
          {orderItems.map((item, index) => (
            <View key={item?.id || index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item?.name || `Sản phẩm #${item?.product_id}`}
                </Text>
                <Text style={styles.itemPrice}>
                  {(item?.price || 0).toLocaleString()} VNĐ x{" "}
                  {item?.quantity || 0}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {((item?.price || 0) * (item?.quantity || 0)).toLocaleString()}{" "}
                VNĐ
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString()} VNĐ
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: "#888", marginBottom: 20 },
  backBtn: { backgroundColor: "#FF6C22", padding: 12, borderRadius: 8 },
  backBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  header: {
    backgroundColor: "#FFF",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FF6C22" },
  card: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  addressText: {
    // CSS thêm cho phần địa chỉ
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },

  // Styles cho Tracking
  trackingItem: { flexDirection: "row", marginBottom: 15 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#CCC",
    marginTop: 5,
    marginRight: 10,
  },
  activeDot: { backgroundColor: "#00BA61" }, // Xanh lá báo hiệu status mới nhất
  trackingContent: { flex: 1 },
  trackingStatus: { fontSize: 16, fontWeight: "bold", color: "#666" },
  activeText: { color: "#00BA61" },
  trackingNote: { fontSize: 14, color: "#888", marginTop: 2 },

  // Styles cho Order Items
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  itemPrice: { fontSize: 14, color: "#666" },
  itemTotal: { fontSize: 16, fontWeight: "bold", color: "#FF6C22" },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 15 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 20, fontWeight: "bold", color: "#E53935" },
});
