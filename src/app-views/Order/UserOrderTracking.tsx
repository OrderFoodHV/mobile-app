import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import socket from "../../app-helper/socketHelper";
import useCallAPI from "../../app-helper/useCallAPI";
import URL_API from "../../app-helper/urlAPI";

const UserOrderTracking = ({ route, navigation }: any) => {
  // Lấy ID đơn hàng vừa đặt từ route.params truyền sang
  const { orderId } = route.params;
  const token = useSelector((state: any) => state.auth.tokenData);

  // Bản đồ trạng thái (State Machine)
  const [orderStatus, setOrderStatus] = useState("pending");
  const [driverInfo, setDriverInfo] = useState<any>(null);

  // Fetch initial status from backend on mount
  useEffect(() => {
    const fetchInitialStatus = async () => {
      if (!token) return;
      try {
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/tracking/${orderId}`,
          token: token,
          showToast: false,
        });
        const orderInfo = res?.data?.order_info || res?.order_info;
        if (orderInfo) {
          const dbStatus = orderInfo.status;
          if (dbStatus === "Quán đã nhận đơn") {
            setOrderStatus("preparing");
          } else if (dbStatus === "Đang giao hàng" || dbStatus === "delivering") {
            setOrderStatus("delivering");
          } else if (dbStatus === "Đơn đã bị hủy" || dbStatus === "cancelled") {
            setOrderStatus("cancelled");
          } else {
            setOrderStatus(dbStatus);
          }
        }
      } catch (err) {
        console.log("Lỗi fetchInitialStatus:", err);
      }
    };
    fetchInitialStatus();
  }, [orderId, token]);

  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // 1. Join vào phòng (room) riêng của đơn hàng này để hóng tin
    socket.emit("join_order_room", { orderId });

    // 2. Lắng nghe các sự kiện từ Backend bắn về
    socket.on("order_status_updated", (data) => {
      setOrderStatus(data.status); // Cập nhật trạng thái

      // Nếu có thông tin tài xế thì lưu lại để vẽ UI
      if (data.driver) {
        setDriverInfo(data.driver);
      }
    });

    // Rời phòng khi thoát màn hình
    return () => {
      socket.emit("leave_order_room", { orderId });
      socket.off("order_status_updated");
    };
  }, [orderId]);

  // Hàm render giao diện tùy theo Trạng thái
  const renderStatusUI = () => {
    switch (orderStatus) {
      case "pending": // Giai đoạn 1
        return (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.statusTitle}>Đang chờ quán xác nhận...</Text>
            <TouchableOpacity style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Hủy đơn</Text>
            </TouchableOpacity>
          </View>
        );
      case "preparing": // Giai đoạn 2 - Quán đã nhận
      case "finding_driver": // Đang tìm xế
        return (
          <View style={styles.statusBox}>
            <Feather
              name="loader"
              size={40}
              color="#F97316"
              style={styles.spinIcon}
            />
            <Text style={styles.statusTitle}>Quán đang chuẩn bị món</Text>
            <Text style={styles.statusSub}>
              Hệ thống đang tìm tài xế tốt nhất cho bạn...
            </Text>
          </View>
        );
      case "driver_assigned": // Giai đoạn 3 - Xế nhận đơn
      case "driver_arrived": // Giai đoạn 4 - Xế tới quán
      case "delivering": // Giai đoạn 5 - Đang giao
        return (
          <View style={styles.statusBox}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: orderStatus === "delivering" ? "100%" : "50%" },
                ]}
              />
            </View>
            <Text style={styles.statusTitle}>
              {orderStatus === "delivering"
                ? "Tài xế đang trên đường giao đến bạn!"
                : "Tài xế đang lấy hàng tại quán"}
            </Text>

            {/* CARD TÀI XẾ VIP */}
            {driverInfo && (
              <View style={styles.driverCard}>
                <Image
                  source={{ uri: driverInfo.avatar }}
                  style={styles.driverAvatar}
                />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driverInfo.name}</Text>
                  <Text style={styles.driverVehicle}>
                    {driverInfo.vehicle} •{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {driverInfo.licensePlate}
                    </Text>
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="message-circle" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="phone" size={20} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      case "completed": // Giai đoạn 6
        return (
          <View style={styles.statusBox}>
            <Feather name="check-circle" size={60} color="#10B981" />
            <Text
              style={[styles.statusTitle, { color: "#10B981", marginTop: 10 }]}
            >
              🎉 Đơn hàng hoàn tất! 🎉
            </Text>
            <TouchableOpacity style={styles.rateBtn}>
              <Text style={styles.rateText}>Đánh giá đơn hàng</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* bạn có thể nhét Google Maps vào đây nếu muốn */}
      <View style={styles.mapPlaceholder}>
        <Feather name="map" size={50} color="#D1D5DB" />
        <Text style={{ color: "#9CA3AF" }}>Bản đồ hành trình</Text>
      </View>

      {/* Khối trạng thái */}
      <View style={styles.bottomSheet}>{renderStatusUI()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    minHeight: 250,
  },
  statusBox: { alignItems: "center", width: "100%" },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 15,
    textAlign: "center",
  },
  statusSub: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
    textAlign: "center",
  },
  spinIcon: {
    marginBottom: 10,
  },
  cancelBtn: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
  },
  cancelText: { color: "#EF4444", fontWeight: "bold" },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 15,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#F97316" },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  driverAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  driverVehicle: { fontSize: 13, color: "#6B7280" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 2,
  },
  rateBtn: {
    marginTop: 20,
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  rateText: { color: "#fff", fontWeight: "bold" },
});
export default UserOrderTracking;
