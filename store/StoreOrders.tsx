import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { Container } from "../src/app-layout/Layout";
import colors from "../src/assets/colors/global_colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";

const TABS = [
  { id: "pending", label: "Chờ duyệt" },
  { id: "confirmed", label: "Đã nhận" },
  { id: "delivering", label: "Đang giao" },
  { id: "completed", label: "Lịch sử" },
];

const StoreOrders = () => {
  const navigation = useNavigation<any>();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [storeId, setStoreId] = useState<number>(1);

  // 🌟 HÀM KÉO DỮ LIỆU THẬT TỪ DATABASE
  const fetchOrders = async () => {
    if (!storeId || !tokenData) return;
    setLoading(true);
    try {
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/api/store/${storeId}/orders?status=${activeTab}`,
        token: tokenData,
      });

      if (res && res.status === "success") {
        const actualOrders = res.data?.orders || res.data;
        if (Array.isArray(actualOrders)) {
          setOrders(actualOrders);
        }
      }
    } catch (error) {
      console.log("Lỗi lấy đơn hàng từ Backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, storeId]);

  // 🌟 RADA QUÉT ĐƠN THẬT TỪ DATABASE MỖI 5 GIÂY
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "pending" && storeId && tokenData) {
      interval = setInterval(async () => {
        try {
          const res = await useCallAPI({
            method: "GET",
            url: `${URL_API}/api/store/${storeId}/orders?status=pending`,
            token: tokenData,
          });

          if (res && res.status === "success") {
            const actualOrders = res.data?.orders || res.data;
            if (Array.isArray(actualOrders)) {
              setOrders((prevOrders) => {
                // Nếu DB có đơn mới nhiều hơn số đơn đang hiển thị -> Nổ thông báo
                if (actualOrders.length > prevOrders.length) {
                  Alert.alert(
                    "🔔 CÓ ĐƠN HÀNG MỚI!",
                    "Khách vừa đặt món xong! Sếp vào duyệt ngay cho nóng!",
                    [{ text: "XEM NGAY" }],
                  );
                }
                return actualOrders;
              });
            }
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, storeId, tokenData]);

  // 🌟 CẬP NHẬT TRẠNG THÁI THẬT LÊN DATABASE
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await useCallAPI({
        method: "PUT",
        url: `${URL_API}/api/store/${storeId}/orders/${orderId}/status`,
        token: tokenData,
        payload: { status: newStatus, note: "Cửa hàng xử lý" },
      });

      if (res.status === "success" || res.status === 200) {
        Alert.alert(
          "Thành công",
          `Đã chuyển đơn #${orderId} sang trạng thái mới!`,
        );
        fetchOrders(); // Kéo lại dữ liệu thật từ DB để UI cập nhật
      }
    } catch (error) {
      console.log("Lỗi cập nhật trạng thái:", error);
      Alert.alert(
        "Lỗi",
        "Không thể duyệt đơn lúc này, sếp kiểm tra lại mạng hoặc Backend nhen.",
      );
    }
  };

  const renderOrderCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Đơn #{item.id}</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.customerName}>
            <Feather name="user" size={14} />{" "}
            {item.customer_name || `Khách hàng #${item.user_id}`}
          </Text>
          <Text style={styles.address} numberOfLines={2}>
            <Feather name="map-pin" size={14} /> {item.address}
          </Text>
        </View>
        <Text style={styles.totalPrice}>
          {Number(item.total_price).toLocaleString("vi-VN")}đ
        </Text>
      </View>

      {activeTab === "pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnReject]}
            onPress={() => handleUpdateStatus(item.id, "cancelled")}
          >
            <Text style={styles.btnTextReject}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnAccept]}
            onPress={() => handleUpdateStatus(item.id, "confirmed")}
          >
            <Text style={styles.btnTextAccept}>Nhận đơn</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "confirmed" && (
        <TouchableOpacity
          style={[styles.btn, styles.btnAccept, { marginTop: 10 }]}
          onPress={() => handleUpdateStatus(item.id, "delivering")}
        >
          <Text style={styles.btnTextAccept}>Giao cho Tài xế</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Container style={{ backgroundColor: "#F9FAFB" }}>
      <View
        style={{ position: "relative", backgroundColor: colors.blue_primary }}
      >
        <HeaderApp title="Kênh Người Bán" />
        <View style={styles.headerActionGroup}>
          <TouchableOpacity onPress={fetchOrders} style={{ padding: 8 }}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.blue_primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderCard}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyView}>
              <Feather name="inbox" size={50} color="#D1D5DB" />
              <Text style={styles.emptyText}>Chưa có đơn hàng nào sếp ơi!</Text>
            </View>
          )}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  headerActionGroup: {
    position: "absolute",
    right: 10,
    bottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  tabContainer: { flexDirection: "row", backgroundColor: "#fff", elevation: 2 },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: colors.blue_primary },
  tabText: { color: "#6B7280", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: colors.blue_primary },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderId: { fontWeight: "bold", fontSize: 16, color: colors.blue_primary },
  time: { color: "#9CA3AF", fontSize: 12 },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  customerName: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  address: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  totalPrice: { fontSize: 17, fontWeight: "bold", color: "#EF4444" },
  actionRow: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnReject: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  btnAccept: { backgroundColor: colors.blue_primary },
  btnTextReject: { color: "#EF4444", fontWeight: "bold" },
  btnTextAccept: { color: "#fff", fontWeight: "bold" },
  emptyView: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, color: "#9CA3AF", fontSize: 15 },
});

export default StoreOrders;
