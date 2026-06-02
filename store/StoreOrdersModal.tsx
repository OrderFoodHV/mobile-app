import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";

const STATUS_LABELS: Record<string, string> = {
  all: "Tất cả đơn hàng",
  completed: "Đơn giao thành công",
  cancelled: "Đơn hàng đã hủy",
};

interface StoreOrdersModalProps {
  visible: boolean;
  onClose: () => void;
  storeId: string | number;
  token: string;
  statusType: "all" | "completed" | "cancelled";
}

const StoreOrdersModal: React.FC<StoreOrdersModalProps> = ({
  visible,
  onClose,
  storeId,
  token,
  statusType,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchOrders();
    }
  }, [visible, statusType]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const statusQuery = statusType === "all" ? "" : `?status=${statusType}`;
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/orders${statusQuery}`,
        token,
      });
      if (res && !res.error && res.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>
      <Text style={styles.address} numberOfLines={2}>
        Giao đến: {item.address}
      </Text>
      <Text style={styles.price}>
        {Number(item.total_price).toLocaleString("vi-VN")} đ
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{STATUS_LABELS[statusType]}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0284C7" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Không có đơn hàng nào!</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0284C7",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  closeText: { color: "#fff", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#6B7280" },
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: "bold" },
  orderStatus: { fontSize: 14, color: "#0284C7", fontWeight: "600" },
  address: { fontSize: 14, color: "#4B5563", marginBottom: 8 },
  price: { fontSize: 16, fontWeight: "bold", color: "#EF4444" },
});

export default StoreOrdersModal;
