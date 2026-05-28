import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import socket from "src/app-helper/socketHelper";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { updateAuthInfor, resetAllAuth } from "src/redux/features/authSlice";

const ShipperHome = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(false);
  // currentOrder chỉ lưu đơn đang GIAO (delivering state)
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  // orderQueue lưu TẤT CẢ đơn đang chờ tài xế nhận
  const [orderQueue, setOrderQueue] = useState<any[]>([]);

  const user = useSelector((state: any) => state.auth);
  const displayName = user?.account?.user_name || user?.name || "Tài xế";

  // Kiểm tra quyền tài xế mỗi khi mở màn hình này lên
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const checkShipperStatus = async () => {
        const token = user?.tokenData;
        if (!token) return;
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/users/me`,
          token: token,
          showToast: false,
        });
        if (isMounted) {
          if (res && (res.status === 401 || res.success === false)) {
            dispatch(resetAllAuth());
            navigation.replace("Login");
          } else if (res && res.success !== false) {
            const profile = res;
            // Cập nhật lại thông tin mới nhất vào Redux để đồng bộ giao diện cá nhân
            dispatch(
              updateAuthInfor({
                is_shipper: profile.is_shipper,
                is_seller: profile.is_seller,
                shipperStatus: profile.shipperStatus,
                storeStatus: profile.storeStatus,
                phone: profile.phone,
                user_name: profile.name || profile.user_name,
              })
            );
          
          // Nếu không còn là shipper nữa (bị xóa hoặc bị khóa)
          // Nếu bị xóa (is_shipper !== 1 và shipperStatus không phải blocked) thì đá ra ngoài bắt đăng ký lại
          if (Number(profile.is_shipper) !== 1 && profile.shipperStatus !== "blocked") {
            Alert.alert(
              "Thông báo",
              "Tài khoản của bạn đã bị hủy quyền tài xế. Vui lòng đăng ký lại!",
              [
                {
                  text: "Đồng ý",
                  onPress: () => {
                    navigation.navigate("BottomContainer");
                  },
                },
              ]
            );
          }
        }
       }
      };
      
      checkShipperStatus();
      return () => {
        isMounted = false;
      };
    }, [user?.tokenData])
  );

  // Dùng ref để tránh useEffect re-register socket listener mỗi lần state thay đổi
  const isOnlineRef = useRef(isOnline);
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  // Tự động chuyển thành ngoại tuyến khi thoát kênh tài xế (màn hình cha bị blur)
  useEffect(() => {
    const parentNav = navigation.getParent();
    if (parentNav) {
      const unsubscribe = parentNav.addListener("blur", () => {
        setIsOnline(false);
      });
      return unsubscribe;
    }
  }, [navigation]);

  useEffect(() => {
    const updateDbStatus = async () => {
      const statusStr = isOnline ? "idle" : "offline";
      const token = user?.tokenData;
      if (token) {
        const res = await useCallAPI({
          method: "PATCH",
          url: `${URL_API}/shippers/status`,
          token: token,
          data: { status: statusStr },
          showToast: false,
        });
        if (res && res.success === false) {
          if (res.status === 403) {
            // Kiểm tra xem là bị khóa hay bị xóa
            const isBlocked = user?.account?.shipperStatus === "blocked";
            const alertMsg = isBlocked 
              ? "Tài khoản của bạn đang bị tạm khóa!" 
              : "Tài khoản của bạn đã bị hủy quyền tài xế. Vui lòng đăng ký lại!";
            
            if (isOnline) {
              Alert.alert(
                "Thông báo",
                alertMsg,
                [
                  {
                    text: "Đồng ý",
                    onPress: () => {
                      setIsOnline(false);
                      if (!isBlocked) {
                        navigation.navigate("BottomContainer");
                      }
                    },
                  },
                ]
              );
            }
          } else {
            setIsOnline(false);
          }
        }
      }
    };
    updateDbStatus();

    if (isOnline) {
      if (!socket.connected) socket.connect();
      socket.emit("register_shipper");

      socket.on("broadcast_new_order", (orderData: any) => {
        console.log("🎯 RADAR HỨNG ĐƯỢC ĐƠN MỚI:", orderData);
        // Thêm vào hàng đợi, tài xế tự chọn đơn nào muốn nhận
        setOrderQueue((prev) => {
          // Tránh thêm trùng đơn
          const exists = prev.some((o) => o.orderId === orderData.orderId);
          if (exists) return prev;
          return [...prev, orderData];
        });
      });
    } else {
      socket.off("broadcast_new_order");
      if (socket.connected) socket.disconnect();
      setOrderQueue([]);
      setCurrentOrder(null);
    }

    return () => {
      socket.off("broadcast_new_order");
    };
  }, [isOnline]); // Chỉ phụ thuộc vào isOnline, không tái đăng ký khi state đơn thay đổi

  const handleCallCustomer = (phone: string) => {
    if (!phone || phone === "Chưa cập nhật") {
      Alert.alert("Thông báo", "Khách hàng này chưa cập nhật số điện thoại sếp ơi!");
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Lỗi", "Không thể kích hoạt trình gọi điện lúc này.");
    });
  };

  // Nhận một đơn cụ thể từ danh sách hàng đợi
  const handleAcceptOrder = (order: any) => {
    socket.emit("driver_accepts", {
      orderId: order.orderId,
      driverData: { name: displayName },
    });
    // Chuyển sang trạng thái giao hàng và xóa khỏi hàng đợi
    setCurrentOrder(order);
    setOrderQueue((prev) => prev.filter((o) => o.orderId !== order.orderId));
  };

  // Bỏ qua (xóa) một đơn cụ thể khỏi hàng đợi
  const handleDismissOrder = (order: any) => {
    setOrderQueue((prev) => prev.filter((o) => o.orderId !== order.orderId));
  };

  const handleCompleteOrder = () => {
    if (!currentOrder) return;
    socket.emit("driver_completed", { orderId: currentOrder.orderId });

    Alert.alert(
      "Thành công 🎉",
      `Sếp đã hoàn thành đơn #${currentOrder.orderId}! +${Number(currentOrder.shipping_fee).toLocaleString()}đ đã được cộng vào ví thu nhập.`,
    );
    setCurrentOrder(null);
  };

  // Render từng card đơn hàng trong hàng đợi
  const renderOrderQueueCard = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.newOrderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.badgeNew}>
          <Text style={styles.badgeText}>🔔 ĐƠN #{item.orderId}</Text>
        </View>
        <Text style={styles.orderPrice}>
          +{Number(item.shipping_fee).toLocaleString("vi-VN")}đ
        </Text>
      </View>

      <View style={styles.orderRoute}>
        <View style={styles.routeItem}>
          <Feather name="map-pin" size={16} color="#F97316" />
          <View style={{ flex: 1 }}>
            <Text style={styles.routeText} numberOfLines={1}>
              🏪 Quán: {item.restaurant}
            </Text>
            <Text style={styles.routeSubText} numberOfLines={1}>
              📍 {item.restaurant_address || "Chưa cập nhật địa chỉ"}
            </Text>
          </View>
        </View>
        <View style={styles.routeDash} />
        <View style={styles.routeItem}>
          <Feather name="navigation" size={16} color="#3B82F6" />
          <Text style={styles.routeText} numberOfLines={2}>
            🚴 Giao: {item.address}
          </Text>
        </View>
      </View>

      {/* Thông tin thêm */}
      <View style={styles.orderMeta}>
        <Text style={styles.metaText}>
          📦 Món: {item.items?.map((i: any) => `${i.name} x${i.quantity}`).join(", ") || "Xem chi tiết"}
        </Text>
        <Text style={styles.metaText}>
          💰 COD: {Number(item.total_price).toLocaleString("vi-VN")}đ  •  📍 {item.distance ? `${item.distance}km` : "N/A"}
        </Text>
        {item.note && item.note !== "Không có ghi chú" && (
          <Text style={styles.noteText}>📝 {item.note}</Text>
        )}
      </View>

      <View style={styles.actionRowGap}>
        <TouchableOpacity
          style={styles.btnSkip}
          onPress={() => handleDismissOrder(item)}
        >
          <Text style={styles.btnSkipText}>Bỏ qua</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnAccept}
          onPress={() => handleAcceptOrder(item)}
        >
          <Text style={styles.btnAcceptText}>NHẬN ĐƠN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
            {isOnline ? `Trực tuyến${orderQueue.length > 0 ? ` (${orderQueue.length} đơn)` : ""}` : "Ngoại tuyến"}
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
          ) : currentOrder ? (
            /* SUB-SCREEN 1: ĐANG GIAO HÀNG */
            <View style={styles.deliveringCard}>
              <View style={styles.deliveringHeader}>
                <Feather name="navigation" size={24} color="#F97316" />
                <Text style={styles.deliveringTitle}>
                  HÀNH TRÌNH ĐANG GIAO ĐƠN #{currentOrder?.orderId}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>🏪 Lấy hàng tại quán:</Text>
                <Text style={styles.infoValue}>{currentOrder?.restaurant}</Text>
                <Text style={styles.infoAddressSub}>{currentOrder?.restaurant_address || "Chưa cập nhật địa chỉ quán"}</Text>
                <Text style={styles.infoLabel}>📍 Giao đến:</Text>
                <Text style={styles.infoValue}>{currentOrder?.address}</Text>
                <Text style={styles.infoLabel}>👤 Khách hàng:</Text>
                <Text style={styles.infoValue}>{currentOrder?.customer_name}</Text>
                <Text style={styles.infoLabel}>📞 Điện thoại:</Text>
                <Text style={styles.infoValue}>{currentOrder?.customer_phone}</Text>
                <Text style={styles.infoLabel}>📝 Ghi chú đơn:</Text>
                <Text style={styles.noteValue}>{currentOrder?.note}</Text>
              </View>

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
                  onPress={() => handleCallCustomer(currentOrder?.customer_phone)}
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

              {/* Hiển thị số đơn đang chờ trong hàng đợi */}
              {orderQueue.length > 0 && (
                <View style={styles.queueBanner}>
                  <Text style={styles.queueBannerText}>
                    🔔 Đang có {orderQueue.length} đơn mới chờ bạn sau khi giao xong!
                  </Text>
                </View>
              )}
            </View>
          ) : orderQueue.length > 0 ? (
            /* SUB-SCREEN 2: DANH SÁCH TẤT CẢ ĐƠN HÀNG ĐANG CHỜ */
            <View>
              <Text style={styles.queueHeader}>
                📋 {orderQueue.length} đơn đang chờ — chọn đơn muốn nhận:
              </Text>
              {orderQueue.map((order, index) => renderOrderQueueCard({ item: order, index }))}
            </View>
          ) : (
            /* SUB-SCREEN 3: CHỜ RADAR QUÉT */
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
  routeSubText: { fontSize: 12, color: "#6B7280", fontWeight: "400", marginTop: 2 },
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
  infoAddressSub: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "400",
    marginBottom: 6,
    fontStyle: "italic",
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

  // Styles cho danh sách hàng đợi đơn
  queueHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  orderMeta: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  noteText: {
    fontSize: 12,
    color: "#EA580C",
    fontWeight: "600",
    marginTop: 2,
  },
  queueBanner: {
    marginTop: 14,
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDBA74",
    alignItems: "center",
  },
  queueBannerText: {
    color: "#C2410C",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
});
export default ShipperHome;
