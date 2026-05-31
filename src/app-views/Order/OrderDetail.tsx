import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AppImage from "@app-uikits/AppImage";
import { useRoute } from "@react-navigation/native";
import { useSelector, shallowEqual } from "react-redux";
import { Content } from "@app-layout/Layout";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { RootState } from "@redux/store";
import { useNavigationServices } from "@app-helper/navigateToScreens";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useAppTheme } from "src/app-context/ThemeContext";

// 🔥 THÊM SOCKET.IO CLIENT
import { io } from "socket.io-client";

const STATUS_STEPS = ["pending", "confirmed", "delivering", "completed"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đang chế biến",
  delivering: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const OrderDetail: React.FC = () => {
  const { themeColors } = useAppTheme();
  const route = useRoute<any>();
  const { goToBack, replaceScreen } = useNavigationServices();

  const { tokenData, user } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const userId = user?.id || tokenData?.user_id || 1; // Lấy ID của khách hàng để đăng ký phòng Socket

  const passedData = route.params?.data || {};
  const [order, setOrder] = useState<any>(passedData);
  const [productsList, setProductsList] = useState<any[]>(
    passedData?.items || passedData?.products || [],
  );
  const [loading, setLoading] = useState(false);

  // 🔥 SỬA LỖI DÒNG 66 VÀ QUÉT DỮ LIỆU
  const displayId =
    order?.order_id ||
    order?.id ||
    passedData?.order_id ||
    passedData?.id ||
    "Đang xử lý...";
  const displayAddress =
    order?.address && order.address !== "Đang cập nhật..."
      ? order.address
      : passedData?.address || "Chưa có địa chỉ";
  const displayTotal = order?.total_price || passedData?.total_price || 0;

  // Bùa ép trạng thái
  const rawStatus =
    order?.status ||
    order?.order_status ||
    passedData?.status ||
    passedData?.order_status ||
    "pending";
  let activeStatus = String(rawStatus).trim().toLowerCase();
  if (activeStatus === "quán đã nhận đơn" || activeStatus === "preparing" || activeStatus === "confirmed") {
    activeStatus = "confirmed";
  } else if (activeStatus === "đang giao hàng" || activeStatus === "delivering") {
    activeStatus = "delivering";
  } else if (activeStatus === "completed" || activeStatus === "hoàn thành" || activeStatus === "giao hàng thành công") {
    activeStatus = "completed";
  } else if (activeStatus === "đơn đã bị hủy" || activeStatus === "cancelled") {
    activeStatus = "cancelled";
  } else {
    activeStatus = "pending";
  }
  const currentStepIndex = STATUS_STEPS.indexOf(activeStatus);

  let statusBannerText = "";
  if (activeStatus === "pending")
    statusBannerText =
      "⏱️ Cửa hàng đang tiếp nhận đơn. Vui lòng chờ trong giây lát...";
  else if (activeStatus === "confirmed")
    statusBannerText = "🍳 Cửa hàng đã xác nhận và đang chuẩn bị món!";
  else if (activeStatus === "delivering")
    statusBannerText = "🚀 Tài xế đang trên đường giao món đến bạn...";
  else if (activeStatus === "completed")
    statusBannerText = "🎉 Đơn hàng giao thành công. Chúc bạn ngon miệng!";
  else if (activeStatus === "cancelled")
    statusBannerText = "❌ Đơn hàng này đã bị hủy.";

  const fetchOrderDetails = async () => {
    if (!displayId || displayId === "Đang xử lý..." || !tokenData) return;
    try {
      const response = await useCallAPI({
        method: "GET",
        url: `${URL_API}/tracking/${displayId}`,
        token: tokenData,
      });
      if (response?.order_info || response?.data?.order_info) {
        const orderInfo = response?.order_info || response?.data?.order_info;
        const orderItems = response?.items || response?.data?.items || [];
        setOrder((prev: any) => ({ ...prev, ...orderInfo }));
        setProductsList(orderItems);
      }
    } catch (error) {
      console.log("Lỗi tải ngầm:", error);
    }
  };

  // 🔥 KHỞI TẠO VÀ LẮNG NGHE SOCKET.IO
  useEffect(() => {
    fetchOrderDetails();

    // Kết nối đến Server Socket Backend (bạn nhớ đảm bảo URL_API hoặc địa chỉ IP trỏ đúng)
    const socketUrl = URL_API
      ? URL_API.replace("/api", "")
      : "http://192.168.1.31:3000";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log(
        `🔌 Kết nối Socket thành công! Đăng ký vào phòng User ID: ${userId} và đơn: ${displayId}`,
      );
      socket.emit("register_user", userId);
      socket.emit("join_order_room", { orderId: displayId });
    });

    // Nhận tín hiệu từ Quán / Shipper
    socket.on("order_status_updated", (data: any) => {
      console.log("🔥 Nhận được tin Socket đổi trạng thái:", data);
      setOrder((prev: any) => ({
        ...prev,
        status: data.status,
        order_status: data.status,
      }));
    });

    return () => {
      socket.emit("leave_order_room", { orderId: displayId });
      socket.disconnect();
    };
  }, [displayId, userId]);

  const handleCancel = async () => {
    if (!displayId || displayId === "Đang xử lý..." || !tokenData) return;
    Alert.alert(
      "Xác nhận hủy",
      "bạn có chắc chắn muốn hủy đơn hàng này không?",
      [
        { text: "Đóng", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              await useCallAPI({
                method: "PATCH",
                url: `${URL_API}/tracking/${displayId}/status`,
                token: tokenData,
                data: { status: "cancelled" },
                showToast: true,
              });
              setOrder((prev: any) => ({
                ...prev,
                status: "cancelled",
                order_status: "cancelled",
              }));
            } catch (e) {
              Alert.alert("Lỗi", "Không thể hủy!");
            }
          },
        },
      ],
    );
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View
      style={[
        styles.productCard,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          borderWidth: 1,
        },
      ]}
    >
      <AppImage source={{ uri: item?.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text
          style={[styles.productName, { color: themeColors.text }]}
          numberOfLines={2}
        >
          {item?.name}
        </Text>
        <Text
          style={[
            styles.productMeta,
            { color: themeColors.text, marginTop: 4 },
          ]}
        >
          Số lượng: {item?.quantity}
        </Text>
        <Text style={[styles.productMeta, { color: themeColors.text }]}>
          Giá: {Number(item?.price || 0).toLocaleString()} đ
        </Text>
        <Text style={styles.productTotal}>
          Thành tiền:{" "}
          {(
            Number(item?.price || 0) * Number(item?.quantity || 1)
          ).toLocaleString()}{" "}
          đ
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }} edges={["top", "left", "right"]}>
      <HeaderCustom
        title="Theo dõi đơn hàng"
        onPressLeft={
          passedData?.trigger
            ? () => replaceScreen("BottomContainer")
            : () => goToBack()
        }
      />
      <Content style={styles.container}>
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Trạng thái đơn hàng
          </Text>
          <View style={styles.progressContainer}>
            {STATUS_STEPS.map((status, index) => {
              const isActive =
                index <= currentStepIndex && activeStatus !== "cancelled";
              const isCancelled = activeStatus === "cancelled";
              return (
                <View key={status} style={styles.progressStep}>
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor: isCancelled
                          ? "#EF4444"
                          : isActive
                            ? "#3B82F6"
                            : "#E5E7EB",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.circleText,
                        { color: isActive || isCancelled ? "#fff" : "#9CA3AF" },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.statusLabel,
                      {
                        color: isCancelled
                          ? "#EF4444"
                          : isActive
                            ? themeColors.text
                            : "#9CA3AF",
                      },
                    ]}
                  >
                    {STATUS_LABELS[status]}
                  </Text>
                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        {
                          backgroundColor: isCancelled
                            ? "#EF4444"
                            : isActive
                              ? "#3B82F6"
                              : "#E5E7EB",
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Banner */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor:
                activeStatus === "cancelled" ? "#FEF2F2" : "#EFF6FF",
              borderColor: activeStatus === "cancelled" ? "#FECACA" : "#BFDBFE",
            },
          ]}
        >
          <Text
            style={[
              styles.bannerText,
              { color: activeStatus === "cancelled" ? "#991B1B" : "#1E40AF" },
            ]}
          >
            {statusBannerText}
          </Text>
        </View>

        {/* Thanh Toán */}
        <View
          style={[
            styles.orderCard,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Chi tiết thanh toán
          </Text>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>Mã đơn:</Text>
            <Text
              style={[
                styles.value,
                { color: themeColors.text, fontWeight: "600" },
              ]}
            >
              #{displayId}
            </Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>Thanh toán:</Text>
            <Text style={[styles.value, { color: themeColors.text }]}>
              Tiền mặt (COD)
            </Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>Thời gian:</Text>
            <Text style={[styles.value, { color: themeColors.text }]}>
              {order?.created_at
                ? new Date(order.created_at).toLocaleString("vi-VN")
                : new Date().toLocaleString("vi-VN")}
            </Text>
          </View>
          {Number(order?.shipping_fee) > 0 && (
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Phí giao hàng (Ship):</Text>
              <Text style={[styles.value, { color: themeColors.text }]}>
                +{Number(order.shipping_fee).toLocaleString()} đ
              </Text>
            </View>
          )}
          {Number(order?.service_fee) > 0 && (
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Phí dịch vụ:</Text>
              <Text style={[styles.value, { color: themeColors.text }]}>
                +{Number(order.service_fee).toLocaleString()} đ
              </Text>
            </View>
          )}
          <View
            style={[
              styles.rowInfo,
              {
                borderTopWidth: 1,
                borderTopColor: themeColors.border,
                paddingTop: 10,
                marginTop: 4,
              },
            ]}
          >
            <Text style={styles.label}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>
              {Number(displayTotal).toLocaleString()} đ
            </Text>
          </View>
        </View>

        {/* Địa chỉ */}
        <View
          style={[
            styles.orderCard,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Giao hàng đến
          </Text>
          <Text
            style={[
              styles.infoText,
              { color: themeColors.text, lineHeight: 20 },
            ]}
          >
            {displayAddress}
          </Text>
        </View>

        {/* Danh sách món */}
        <Text
          style={[
            styles.sectionTitle,
            { color: themeColors.text, marginBottom: 12 },
          ]}
        >
          Danh sách món
        </Text>
        <FlatList
          data={productsList}
          keyExtractor={(item, index) =>
            item?.product_id?.toString() || index.toString()
          }
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={renderProduct}
        />

        {/* Nút Hành Động */}
        <View style={styles.actions}>
          {activeStatus === "pending" ? (
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={handleCancel}
            >
              <Text style={styles.btnText}>Yêu cầu hủy đơn</Text>
            </TouchableOpacity>
          ) : (
            activeStatus !== "cancelled" && (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: themeColors.bg,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                  },
                ]}
                onPress={() =>
                  Alert.alert("Hỗ trợ", "Tổng đài InOrder: 1900 xxxx")
                }
              >
                <Text style={[styles.btnText, { color: themeColors.text }]}>
                  Gọi tổng đài hỗ trợ
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </Content>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  statusCard: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },
  progressStep: { alignItems: "center", flex: 1 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  circleText: { fontWeight: "700", fontSize: 12 },
  line: { flex: 1, height: 3, marginHorizontal: -4, zIndex: 1 },
  statusLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  bannerCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerText: {
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  orderCard: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { fontSize: 14, color: "#6B7280" },
  value: { fontSize: 14, flex: 1, textAlign: "right", marginLeft: 16 },
  infoText: { fontSize: 14 },
  totalPrice: { color: "#EF4444", fontWeight: "700", fontSize: 16 },
  productCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    elevation: 1,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  productInfo: { flex: 1, justifyContent: "center" },
  productName: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  productMeta: { fontSize: 13, color: "#6B7280" },
  productTotal: {
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 6,
    fontSize: 14,
  },
  actions: { flexDirection: "row", marginTop: 10, marginBottom: 40 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#EF4444" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});

export default OrderDetail;
