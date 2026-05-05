import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../api/api";

export default function TrackingScreen({ route }) {
  // Lấy ID đơn hàng được truyền từ màn Lịch sử sang
  const { orderId } = route.params || {};
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    // Gọi API lấy tọa độ / tiến trình của đơn hàng này
    API.get(`/orders/${orderId}/tracking`)
      .then((res) => {
        setTracking(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Lỗi tải Tracking:", err);
        setLoading(false);
      });
  }, [orderId]);

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FF6C22" style={{ flex: 1 }} />
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Lộ trình Đơn #{orderId}</Text>

      {tracking.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>
            Chưa có dữ liệu lộ trình cho đơn này.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracking}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.timelineItem}>
              {/* Cột line bên trái */}
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, index === 0 && styles.dotActive]} />
                {index !== tracking.length - 1 && <View style={styles.line} />}
              </View>

              {/* Nội dung bên phải */}
              <View style={styles.timelineContent}>
                <Text style={styles.statusText}>{item.status}</Text>

                {/* Nếu Shipper có bắn tọa độ về thì hiện lên */}
                {item.latitude && item.longitude && (
                  <Text style={styles.gpsText}>
                    📍 Tọa độ GPS: [{item.latitude}, {item.longitude}]
                  </Text>
                )}

                <Text style={styles.timeText}>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString("vi-VN")
                    : "Đang cập nhật..."}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
    textAlign: "center",
  },
  emptyView: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },
  timelineItem: { flexDirection: "row", minHeight: 80 },
  timelineLeft: { width: 30, alignItems: "center" },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#CCC",
    zIndex: 2,
  },
  dotActive: {
    backgroundColor: "#FF6C22",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#FFECDF",
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
    marginTop: -5,
    marginBottom: -5,
  },
  timelineContent: { flex: 1, paddingBottom: 25, paddingLeft: 10 },
  statusText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  gpsText: {
    fontSize: 14,
    color: "#005BAA",
    marginTop: 4,
    fontStyle: "italic",
  },
  timeText: { fontSize: 12, color: "#999", marginTop: 6 },
});
