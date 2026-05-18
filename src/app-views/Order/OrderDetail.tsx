import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import AppImage from "@app-uikits/AppImage";
import { useRoute } from "@react-navigation/native";
import { useSelector, shallowEqual } from "react-redux";
import { Container, Content } from "@app-layout/Layout";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { RootState } from "@redux/store";
import { useNavigationServices } from "@app-helper/navigateToScreens";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useAppTheme } from "src/app-context/ThemeContext"; // 👉 Ăn theo Dark Mode toàn app

const STATUS_STEPS = ["pending", "confirmed", "delivering", "completed"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đang chế biến",
  delivering: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const OrderDetail: React.FC = () => {
  const { themeColors } = useAppTheme(); // Lấy màu nền động
  const route = useRoute<any>();
  const { data } = route.params ?? {};
  const { goToBack, replaceScreen } = useNavigationServices();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const [order, setOrder] = useState<any>(data);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const rawStatus = order?.status || order?.order_status;
  const activeStatus = rawStatus
    ? String(rawStatus).trim().toLowerCase()
    : "pending";
  const currentStepIndex = STATUS_STEPS.indexOf(activeStatus);

  const fetchOrderDetails = async () => {
    if (!data?.id || !tokenData) return;
    setLoading(true);
    try {
      const response = await useCallAPI({
        method: "GET",
        url: `${URL_API}/tracking/${data.id}`,
        token: tokenData,
      });

      let orderInfo = null;
      let orderItems = [];

      if (response?.order_info) {
        orderInfo = response.order_info;
        orderItems = response.items;
      } else if (response?.data?.order_info) {
        orderInfo = response.data.order_info;
        orderItems = response.data.items;
      } else if (response?.data?.data?.order_info) {
        orderInfo = response.data.data.order_info;
        orderItems = response.data.data.items;
      }

      if (orderInfo) setOrder(orderInfo);
      if (orderItems) setProductsList(orderItems);
    } catch (error) {
      console.log("Lỗi tải chi tiết đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [data?.id, tokenData]);

  const onRefreshData = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  };

  const handleCancel = async () => {
    if (!order?.id || !tokenData) return;
    try {
      await useCallAPI({
        method: "PATCH",
        url: `${URL_API}/tracking/${order.id}/status`,
        token: tokenData,
        data: { status: "cancelled" },
        showToast: true,
        successTitle: "Đã yêu cầu hủy đơn!",
      });
      fetchOrderDetails();
    } catch (error) {
      console.log("Lỗi hủy đơn:", error);
    }
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
        <Text style={[styles.productName, { color: themeColors.text }]}>
          {item?.name}
        </Text>
        <Text style={styles.productDesc}>
          {item?.description || "Món ăn thơm ngon nóng hổi"}
        </Text>
        <Text style={[styles.productMeta, { color: themeColors.text }]}>
          Số lượng: {item?.quantity}
        </Text>
        <Text style={[styles.productMeta, { color: themeColors.text }]}>
          Giá: {Number(item?.price).toLocaleString()} đ
        </Text>
        <Text style={styles.productTotal}>
          Thành tiền:{" "}
          {(Number(item?.price) * Number(item?.quantity)).toLocaleString()} đ
        </Text>
      </View>
    </View>
  );

  return (
    <Container style={{ backgroundColor: themeColors.bg }}>
      <HeaderCustom
        title="Theo dõi đơn hàng"
        onPressLeft={
          data?.trigger
            ? () => replaceScreen("BottomContainer")
            : () => goToBack()
        }
      />

      {loading && productsList.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <Content style={styles.container}>
          {/* 1. THANH TIẾN TRÌNH TRẠNG THÁI */}
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
                const isActive = index <= currentStepIndex;
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
                              : "#D1D5DB",
                        },
                      ]}
                    >
                      <Text style={styles.circleText}>{index + 1}</Text>
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
                                : "#D1D5DB",
                          },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* 🌟 2. BANNER LỜI CHÀO KIỂU GRABFOOD DÀNH CHO KHÁCH */}
          <View
            style={[
              styles.orderCard,
              {
                backgroundColor: "#EFF6FF",
                borderColor: "#BFDBFE",
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={{
                fontWeight: "700",
                color: "#1E40AF",
                fontSize: 14,
                lineHeight: 22,
                textAlign: "center",
              }}
            >
              {activeStatus === "pending" &&
                "⏱️ Đơn hàng đang chờ Cửa hàng xác nhận..."}
              {activeStatus === "confirmed" &&
                "🍳 Quán đang chế biến món ăn nóng hổi..."}
              {activeStatus === "delivering" &&
                "🚀 Tài xế đang vi vu giao món đến bạn..."}
              {activeStatus === "completed" &&
                "🎉 Đơn hàng đã giao thành công. Chúc sếp ngon miệng!"}
              {activeStatus === "cancelled" && "❌ Đơn hàng này đã bị hủy bỏ."}
            </Text>
          </View>

          {/* 🌟 3. KHỐI THÔNG TIN ĐƠN VÀ LIÊN HỆ */}
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
              Đơn vị thực hiện
            </Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              <Text style={styles.label}>Cửa hàng: </Text>Hương Vị Việt Merchant
            </Text>

            {(activeStatus === "delivering" ||
              activeStatus === "completed") && (
              <View
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: themeColors.border,
                }}
              >
                <Text
                  style={[styles.label, { color: "#3B82F6", marginBottom: 4 }]}
                >
                  Tài xế giao hàng:
                </Text>
                <Text
                  style={[
                    styles.infoText,
                    { color: themeColors.text, fontWeight: "500" },
                  ]}
                >
                  Shipper: Nguyễn Văn Đạt - 29X1 123.45
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    style={styles.miniContactBtn}
                    onPress={() =>
                      Alert.alert(
                        "Liên hệ",
                        "Đang kết nối cuộc gọi đến tài xế...",
                      )
                    }
                  >
                    <Text style={styles.miniContactText}>📞 Gọi tài xế</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.miniContactBtn}
                    onPress={() =>
                      Alert.alert("Liên hệ", "Đang mở cổng chat với tài xế...")
                    }
                  >
                    <Text style={styles.miniContactText}>💬 Nhắn tin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* 4. KHỐI THÔNG TIN ĐƠN HÀNG */}
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
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              <Text style={styles.label}>Mã đơn: </Text>#{order?.id}
            </Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              <Text style={styles.label}>Địa chỉ: </Text>
              {order?.address}
            </Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              <Text style={styles.label}>Thanh toán: </Text>
              {order?.payment_status === "paid"
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              <Text style={styles.label}>Ngày đặt: </Text>
              {order?.created_at
                ? new Date(order.created_at).toLocaleString()
                : ""}
            </Text>
            <Text
              style={[
                styles.infoText,
                { color: themeColors.text, marginTop: 4 },
              ]}
            >
              <Text style={styles.label}>Tổng tiền: </Text>
              <Text style={styles.totalPrice}>
                {Number(order?.total_price).toLocaleString()} đ
              </Text>
            </Text>
          </View>

          {/* 5. DANH SÁCH MÓN ĂN */}
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Sản phẩm đã đặt
          </Text>
          <FlatList
            data={productsList}
            keyExtractor={(item, index) =>
              item.product_id?.toString() || index.toString()
            }
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 10 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={renderProduct}
          />

          {/* 🌟 6. NÚT HÀNH ĐỘNG DÀNH RIÊNG CHO KHÁCH HÀNG */}
          <View style={styles.actions}>
            {activeStatus === "pending" ? (
              <TouchableOpacity
                style={[styles.button, styles.cancelBtn]}
                onPress={handleCancel}
              >
                <Text style={styles.btnText}>Yêu cầu hủy đơn hàng</Text>
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
                    Alert.alert(
                      "Hỗ trợ",
                      "Tổng đài InOrder đường dây nóng: 1900.xxxx đang sẵn sàng phục vụ sếp!",
                    )
                  }
                >
                  <Text style={[styles.btnText, { color: themeColors.text }]}>
                    Liên hệ tổng đài hỗ trợ
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </Content>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 4,
  },
  statusCard: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
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
  circleText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  line: { flex: 1, height: 2, marginHorizontal: -4, zIndex: 1 },
  statusLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  orderCard: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  label: { fontWeight: "600" },
  infoText: { marginBottom: 6, fontSize: 14 },
  totalPrice: { color: "#EF4444", fontWeight: "700", fontSize: 16 },
  productCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    elevation: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  productInfo: { flex: 1, justifyContent: "center" },
  productName: { fontSize: 15, fontWeight: "700" },
  productDesc: { fontSize: 12, color: "#6B7280", marginVertical: 4 },
  productMeta: { fontSize: 13, marginTop: 2 },
  productTotal: {
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 4,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 40,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#EF4444" },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 15,
  },
  miniContactBtn: {
    backgroundColor: "#EBF5FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  miniContactText: { color: "#2563EB", fontSize: 13, fontWeight: "700" },
});

export default OrderDetail;
