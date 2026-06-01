import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Linking, // 🌟 THÊM MỚI: Dùng để kích hoạt cuộc gọi điện thoại thật
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import socket from "src/app-helper/socketHelper";

const ShipperHome = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [orderState, setOrderState] = useState("searching"); // "searching" | "found" | "delivering"

  // 🌟 NÂNG CẤP HÀNG ĐỢI: Chuyển sang mảng để lưu nhiều đơn cùng lúc, chống trôi đơn
  const [orderQueue, setOrderQueue] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const user = useSelector((state: any) => state.auth);
  const displayName = user?.name || "Tài xế";

  useEffect(() => {
    if (isOnline) {
      if (!socket.connected) socket.connect();
      socket.emit("register_shipper");

      socket.on("broadcast_new_order", (orderData) => {
        console.log("🎯 RADAR HỨNG ĐƯỢC ĐƠN MỚI:", orderData);
        // Xếp hàng vào mảng queue chứ không đè trực tiếp lên đơn cũ nữa
        setOrderQueue((prevQueue) => {
          const updated = [...prevQueue, orderData];
          if (!currentOrder && orderState === "searching") {
            setCurrentOrder(orderData);
            setOrderState("found");
          }
          return updated;
        });
      });
    } else {
      socket.off("broadcast_new_order");
      if (socket.connected) socket.disconnect();
      setOrderQueue([]);
      setCurrentOrder(null);
      setOrderState("searching");
    }

    return () => {
      socket.off("broadcast_new_order");
    };
  }, [isOnline, currentOrder, orderState]);

  // 🌟 THÊM MỚI: Hàm kích hoạt cuộc gọi điện thoại hệ thống
  const handleCallCustomer = (phone: string) => {
    if (!phone || phone === "Chưa cập nhật") {
      Alert.alert(
        "Thông báo",
        "Khách hàng này chưa cập nhật số điện thoại sếp ơi!",
      );
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Lỗi", "Không thể kích hoạt trình gọi điện lúc này.");
    });
  };

  const handleAcceptOrder = () => {
    if (!currentOrder) return;
    socket.emit("driver_accepts", {
      orderId: currentOrder.orderId,
      driverData: { name: displayName },
    });
    setOrderState("delivering");
  };

  const handleCompleteOrder = () => {
    if (!currentOrder) return;
    socket.emit("driver_completed", { orderId: currentOrder.orderId });

    Alert.alert(
      "Thành công 🎉",
      `Sếp đã hoàn thành đơn #${currentOrder.orderId}! +${Number(currentOrder.shipping_fee).toLocaleString()}đ đã được cộng vào ví thu nhập.`,
    );

    // Loại bỏ đơn vừa giao xong ra khỏi hàng đợi
    setOrderQueue((prevQueue) => {
      const remaining = prevQueue.filter(
        (o) => o.orderId !== currentOrder.orderId,
      );
      if (remaining.length > 0) {
        setCurrentOrder(remaining[0]);
        setOrderState("found");
      } else {
        setCurrentOrder(null);
        setOrderState("searching");
      }
      return remaining;
    });
  };

  // Hàm bỏ qua đơn hiện tại để xem đơn kế tiếp trong hàng đợi
  const handleSkipOrder = () => {
    setOrderQueue((prevQueue) => {
      const remaining = prevQueue.filter(
        (o) => o.orderId !== currentOrder.orderId,
      );
      if (remaining.length > 0) {
        setCurrentOrder(remaining[0]);
        setOrderState("found");
      } else {
        setCurrentOrder(null);
        setOrderState("searching");
      }
      return remaining;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Tài xế InOrder,</Text>
          <Text style={styles.driverName}>{displayName}</Text>
        </View>
        <View style={styles.statusToggle}>
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? "#16A34A" : "#9CA3AF" },
            ]}
          >
            {isOnline ? `Trực tuyến (${orderQueue.length} đơn)` : "Ngoại tuyến"}
          </Text>
          <Switch
            trackColor={{ false: "#D1D5DB", true: "#F97316" }}
            thumbColor={"#ffffff"}
            onValueChange={(val) => setIsOnline(val)}
            value={isOnline}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Màn hình xử lý đơn hàng</Text>

          {!isOnline ? (
            <View style={styles.radarOffline}>
              <Feather name="moon" size={48} color="#9CA3AF" />
              <Text style={styles.offlineTitle}>Sếp đang nghỉ ngơi</Text>
            </View>
          ) : orderState === "delivering" ? (
            /* SUB-SCREEN 1: GIAO DIỆN ĐANG GIAO HÀNG HÀNH TRÌNH THỰC TẾ */
            <View style={styles.deliveringCard}>
              <View style={styles.deliveringHeader}>
                <Feather name="navigation" size={24} color="#F97316" />
                <Text style={styles.deliveringTitle}>
                  HÀNH TRÌNH ĐANG GIAO ĐƠN #{currentOrder?.orderId}
                </Text>
              </View>

              {/* KHỐI THÔNG TIN KHÁCH HÀNG */}
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>👤 Khách hàng:</Text>
                <Text style={styles.infoValue}>
                  {currentOrder?.customer_name}
                </Text>
                <Text style={styles.infoLabel}>📞 Điện thoại:</Text>
                <Text style={styles.infoValue}>
                  {currentOrder?.customer_phone}
                </Text>
                <Text style={styles.infoLabel}>📍 Giao đến:</Text>
                <Text style={styles.infoValue}>{currentOrder?.address}</Text>
                <Text style={styles.infoLabel}>📝 Ghi chú đơn:</Text>
                <Text style={styles.noteValue}>{currentOrder?.note}</Text>
              </View>

              {/* KHỐI DANH SÁCH MÓN ĂN CHI TIẾT */}
              <View style={styles.foodSection}>
                <Text style={styles.foodTitle}>🍔 DANH SÁCH MÓN SHIP:</Text>
                {currentOrder?.items?.map((item: any, idx: number) => (
                  <Text key={idx} style={styles.foodItemText}>
                    • {item.name}{" "}
                    <Text style={{ fontWeight: "700", color: "#F97316" }}>
                      x{item.quantity}
                    </Text>
                  </Text>
                ))}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.cashLabel}>Thu hộ tiền mặt (COD):</Text>
                <Text style={styles.cashValue}>
                  {Number(currentOrder?.total_price).toLocaleString()}đ
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() =>
                    handleCallCustomer(currentOrder?.customer_phone)
                  }
                >
                  <Feather name="phone-call" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Gọi khách</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleCompleteOrder}
                >
                  <Text style={styles.actionBtnText}>Xác nhận giao xong</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : orderState === "found" && currentOrder ? (
            /* SUB-SCREEN 2: GIAO DIỆN HỘP NHẬN ĐƠN MỚI (CÓ HÀNG ĐỢI CHỐNG TRÔI) */
            <View style={styles.newOrderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.badgeNew}>
                  <Text style={styles.badgeText}>
                    🔔 ĐƠN CHỜ ({orderQueue.length})
                  </Text>
                </View>
                <Text style={styles.orderPrice}>
                  +{Number(currentOrder.shipping_fee).toLocaleString("vi-VN")}đ
                </Text>
              </View>

              <View style={styles.orderRoute}>
                <View style={styles.routeItem}>
                  <Feather name="map-pin" size={16} color="#F97316" />
                  <Text style={styles.routeText} numberOfLines={1}>
                    Quán: {currentOrder.restaurant}
                  </Text>
                </View>
                <View style={styles.routeDash} />
                <View style={styles.routeItem}>
                  <Feather name="navigation" size={16} color="#3B82F6" />
                  <Text style={styles.routeText} numberOfLines={2}>
                    Giao: {currentOrder.address}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRowGap}>
                <TouchableOpacity
                  style={styles.btnSkip}
                  onPress={handleSkipOrder}
                >
                  <Text style={styles.btnSkipText}>Bỏ qua đơn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnAccept}
                  onPress={handleAcceptOrder}
                >
                  <Text style={styles.btnAcceptText}>CHẠM NHẬN ĐƠN</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* SUB-SCREEN 3: GIAO DIỆN CHỜ RADAR QUÉT */
            <View style={styles.pulseBox}>
              <Feather
                name="radio"
                size={28}
                color="#F97316"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.pulseText}>
                Hệ thống đang quét radar tìm đơn quanh khu vực của sếp nhen...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: { fontSize: 13, color: "#6B7280" },
  driverName: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  statusToggle: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusText: { fontSize: 14, fontWeight: "600" },
  section: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  radarOffline: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 15,
  },
  pulseBox: {
    backgroundColor: "#FFEDD5",
    padding: 25,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  pulseText: {
    color: "#C2410C",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  newOrderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  badgeNew: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  orderPrice: { fontSize: 24, fontWeight: "bold", color: "#10B981" },
  orderRoute: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  routeDash: {
    width: 2,
    height: 12,
    backgroundColor: "#D1D5DB",
    marginLeft: 7,
  },
  routeText: { fontSize: 14, color: "#374151", fontWeight: "500", flex: 1 },
  actionRowGap: { flexDirection: "row", gap: 10, marginTop: 5 },
  btnSkip: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSkipText: { color: "#4B5563", fontWeight: "bold", fontSize: 15 },
  btnAccept: {
    flex: 2,
    backgroundColor: "#F97316",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAcceptText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  deliveringCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#F97316",
  },
  deliveringHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  deliveringTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#F97316",
    flex: 1,
  },
  infoSection: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
    marginBottom: 2,
  },
  noteValue: { fontSize: 13, color: "#EA580C", fontWeight: "bold" },
  foodSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingVertical: 10,
    marginBottom: 12,
  },
  foodTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4B5563",
    marginBottom: 6,
  },
  foodItemText: { fontSize: 13, color: "#1F2937", marginVertical: 2 },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cashLabel: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  cashValue: { fontSize: 18, fontWeight: "bold", color: "#EF4444" },
  actionButtons: { flexDirection: "row", gap: 10 },
  callButton: {
    flex: 1,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
  },
  completeButton: {
    flex: 1,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
export default ShipperHome;
