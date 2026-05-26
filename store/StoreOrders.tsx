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
import socket from "../src/app-helper/socketHelper";

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
  const storeId = useSelector((state: any) => state.auth.account?.storeId) || 1;

  const fetchOrders = async () => {
    if (!storeId || !tokenData) return;
    setLoading(true);
    try {
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/orders?status=${activeTab}`,
        token: tokenData,
      });

      if (res) {
        const actualOrders = res.orders || res.data?.orders || res.data || res;
        if (Array.isArray(actualOrders)) {
          setOrders(actualOrders);
        }
      }
    } catch (error) {
      console.log("Lỗi fetchOrders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, storeId]);

  // LẮNG NGHE REAL-TIME: Khi shipper bấm nhận đơn, tự động reload lại danh sách
  useEffect(() => {
    if (storeId) {
      // 🌟 THÊM MỚI CHỖ NÀY: Kích hoạt kết nối bộ đàm báo cho app.js gán Quán vào đúng phòng store_room_1
      socket.emit("register_store", storeId);
      console.log(
        `🔌 Quán đã nối sóng thành công vào phòng: store_room_${storeId}`,
      );
    }

    socket.on("order_status_updated", (data) => {
      if (data.type === "driver_found") {
        console.log(
          "🔔 Phát hiện có xế vừa nhận đơn, tự động reload danh sách quán!",
        );
        fetchOrders();
      }
    });
    return () => {
      socket.off("order_status_updated");
    };
  }, [activeTab, storeId]); // Thêm storeId vào dependencies

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTab === "pending" && storeId && tokenData) {
      interval = setInterval(async () => {
        try {
          const res = await useCallAPI({
            method: "GET",
            url: `${URL_API}/store/${storeId}/orders?status=pending`,
            token: tokenData,
          });

          if (res) {
            const actualOrders =
              res.orders || res.data?.orders || res.data || res;
            if (Array.isArray(actualOrders)) {
              setOrders(actualOrders);
            }
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, storeId, tokenData]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await useCallAPI({
        method: "PUT",
        url: `${URL_API}/store/${storeId}/orders/${orderId}/status`,
        token: tokenData,
        data: { status: newStatus, note: "Cửa hàng xử lý" },
      });

      if (res.status === "success" || res.status === 200) {
        Alert.alert("Thành công", `Đã cập nhật trạng thái đơn thành công!`);
        fetchOrders();

        // 🌟 ĐÃ CHUYỂN THÀNH CHUỖI TIẾNG VIỆT THEO CHUẨN ĐỂ PHÁT SÓNG SOCKET KHỚP 100%
        if (newStatus === "Quán đã nhận đơn") {
          socket.emit("store_accepts", { orderId: orderId });
          console.log(`Đã phát loa gọi shipper cho đơn ${orderId}`);
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể duyệt đơn lúc này.");
    }
  };

  // 🌟 SỬA ĐÚNG HÀM NÀY: Kết nối trực tiếp API chi tiết của Backend để bóc mảng items và ghi chú Note sạch (Giữ nguyên)
  const handleShowOrderDetail = async (item: any) => {
    try {
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/orders/${item.id}`,
        token: tokenData,
      });

      const detailData = res?.data || res;

      if (detailData) {
        const foodList =
          detailData.items
            ?.map((f: any) => `• ${f.name} (SL: ${f.quantity})`)
            .join("\n") || "Chưa có thông tin sản phẩm cụ thể.";

        Alert.alert(
          `CHI TIẾT ĐƠN HÀNG #${detailData.id}`,
          `👤 Khách hàng: ${detailData.customer_name || `Hội viên #${detailData.user_id}`}\n` +
            `📞 Số điện thoại: ${detailData.customer_phone || "Chưa cập nhật"}\n` +
            `📍 Địa chỉ: ${detailData.address}\n` +
            `📝 Ghi chú từ khách: ${detailData.note || "Khách không có ghi chú gì thêm"}\n\n` +
            `🍔 DANH SÁCH MÓN ĂN:\n${foodList}\n\n` +
            `💸 Tổng thanh toán món: ${Number(detailData.total_price).toLocaleString("vi-VN")}đ`,
          [{ text: "ĐÓNG", style: "cancel" }],
        );
      } else {
        Alert.alert(
          "Thông báo",
          "Không thể bóc tách dữ liệu chi tiết của đơn này.",
        );
      }
    } catch (err) {
      console.log("Lỗi tải chi tiết đơn:", err);
      Alert.alert("Thông báo", "Hệ thống gặp lỗi khi kết xuất dữ liệu Popup.");
    }
  };

  const renderOrderCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>
          Đơn #{item.id}
          {item.status === "Đơn đã bị hủy" && (
            <Text style={{ color: "#EF4444", fontSize: 13 }}> (Đã hủy)</Text>
          )}
        </Text>
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
          <Text style={styles.address} numberOfLines={1}>
            <Feather name="map-pin" size={14} /> {item.address}
          </Text>

          <View style={styles.foodInlineContainer}>
            {item.items &&
              item.items.map((food: any, idx: number) => (
                <Text key={idx} style={styles.foodInlineText}>
                  📌 {food.name}{" "}
                  <Text style={styles.foodQuantityText}>x{food.quantity}</Text>
                </Text>
              ))}
          </View>
        </View>
        <Text style={styles.totalPrice}>
          {Number(item.total_price).toLocaleString("vi-VN")}đ
        </Text>
      </View>

      <TouchableOpacity
        style={styles.detailBtn}
        onPress={() => handleShowOrderDetail(item)}
      >
        <Text style={styles.detailBtnText}>Xem chi tiết đơn hàng</Text>
      </TouchableOpacity>

      {activeTab === "pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnReject]}
            onPress={() => handleUpdateStatus(item.id, "Đơn đã bị hủy")}
          >
            <Text style={styles.btnTextReject}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnAccept]}
            onPress={() => handleUpdateStatus(item.id, "Quán đã nhận đơn")}
          >
            <Text style={styles.btnTextAccept}>Nhận đơn</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "confirmed" && (
        <View style={{ width: "100%" }}>
          {!item.shipper_id ? (
            <View style={styles.waitingDriverBox}>
              <ActivityIndicator size="small" color="#D97706" />
              <Text style={styles.waitingDriverText}>
                Đang quét radar tìm tài xế gần đây...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.btn, styles.btnAccept, { marginTop: 5 }]}
              onPress={() => handleUpdateStatus(item.id, "Đang giao hàng")}
            >
              <Text style={styles.btnTextAccept}>
                Giao cho Tài xế (Xế đã nhận đơn)
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    justifyContent: "space-between", // 🌟 ĐÃ SỬA LỖI TẠI ĐÂY: Thay thế từ khóa lỗi 'justify Sukho' bằng 'justifyContent'
    alignItems: "center",
    marginBottom: 12,
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
  foodInlineContainer: {
    marginTop: 6,
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  foodInlineText: { fontSize: 13, color: "#4B5563", marginVertical: 1 },
  foodQuantityText: { fontWeight: "bold", color: "#F97316" },
  detailBtn: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  detailBtnText: { color: "#6B7280", fontSize: 13, fontWeight: "500" },
  waitingDriverBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 8,
    marginTop: 5,
  },
  waitingDriverText: { color: "#D97706", fontWeight: "600", fontSize: 13 },
});
export default StoreOrders;
