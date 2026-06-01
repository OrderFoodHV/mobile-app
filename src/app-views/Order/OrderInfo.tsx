import React, { useEffect } from "react";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { Content, Footer } from "@app-layout/Layout";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import {
  createOrder,
  resetCreateOrderResponse,
  resetOrderListData,
} from "@redux/features/orderSlice";
import { AppDispatch, RootState } from "@redux/store";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

const OrderInfo: React.FC = () => {
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { goToOrderDetail } = useNavigationComponentApp();
  const { data } = route.params ?? {}; // mảng sản phẩm
  const { createOrderResponse } = useSelector(
    (state: RootState) => state.order,
    shallowEqual,
  );
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  useEffect(() => {
    if (createOrderResponse?.success) {
      dispatch(resetOrderListData());

      const resData =
        createOrderResponse?.result || createOrderResponse?.data || {};

      // Bóc tách ID an toàn tuyệt đối
      const rawId = resData?.order_id || resData?.id;
      const validId =
        rawId?.insertId ||
        rawId?.id ||
        (Array.isArray(rawId) ? rawId[0] : rawId) ||
        "Đang cập nhật";

      // Tính dự phòng tổng tiền nếu bị khuyết
      const fallbackTotal = data?.items?.reduce(
        (sum: number, item: any) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      );

      // Gói ghém cẩn thận toàn bộ dữ liệu bắn sang màn Tracking
      goToOrderDetail({
        data: {
          ...data, // Giữ lại toàn bộ giỏ hàng (items, address...)
          ...resData, // Ghi đè dữ liệu BE trả về
          id: validId,
          order_id: validId,
          order_status: "pending", // Ép cứng trạng thái lúc vừa đặt xong
          total_price:
            resData?.total_price || data?.total_price || fallbackTotal,
          created_at: new Date().toISOString(), // Lấy giờ hiện tại
          trigger: true,
        },
      });

      dispatch(resetCreateOrderResponse());
    }
  }, [createOrderResponse]);

  const subTotal = data?.items?.reduce(
    (sum: number, item: any) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  ) || 0;

  const shippingFee = Number(data?.shipping_fee || 0);
  const serviceFee = Number(data?.service_fee || 0);
  const finalTotal = Number(data?.total_price || subTotal + shippingFee + serviceFee);
  const discountAmount = Math.max(0, subTotal + shippingFee + serviceFee - finalTotal);

  const handleSend = () => {
    if (tokenData && data) {
      dispatch(createOrder({ data: data, token: tokenData }));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <HeaderCustom
        title={"Thông tin đơn hàng"}
        rightIcon={<View style={{ flex: 1 }}></View>}
      />
      <Content>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hướng dẫn ngắn */}
          <View style={styles.introCard}>
            <View style={styles.introIconBg}>
              <Feather name="shopping-cart" size={20} color={colors.blue_primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>Kiểm tra lại đơn hàng</Text>
              <Text style={styles.introSub}>Vui lòng soát lại địa chỉ và các món ăn trước khi bấm xác nhận đặt hàng nhen sếp!</Text>
            </View>
          </View>

          {/* Địa chỉ giao hàng */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: "#EFF6FF" }]}>
                <Feather name="map-pin" size={16} color={colors.blue_primary} />
              </View>
              <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
            </View>
            <Text style={styles.addressText}>{data?.address}</Text>
          </View>

          {/* Phương thức thanh toán */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: "#F3E8FF" }]}>
                <Feather name="credit-card" size={16} color="#8B5CF6" />
              </View>
              <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
            </View>
            <View style={styles.paymentRow}>
              <Feather 
                name={
                  data?.payment_method?.icon === "dollar-sign" ? "dollar-sign" : 
                  data?.payment_method?.icon === "credit-card" ? "credit-card" : 
                  "pocket"
                } 
                size={16} 
                color="#8B5CF6" 
                style={{ marginRight: 8 }}
              />
              <Text style={styles.paymentText}>
                {data?.payment_method?.label || "Thanh toán khi nhận hàng (COD)"}
              </Text>
            </View>
          </View>

          {/* Thông tin sản phẩm */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: "#ECFDF5" }]}>
                <Feather name="coffee" size={16} color="#10B981" />
              </View>
              <Text style={styles.cardTitle}>Món ăn đã chọn</Text>
            </View>
            
            {data?.items?.map((item: any, index: number) => (
              <View key={index}>
                {index > 0 && <View style={styles.itemDivider} />}
                <View style={styles.productRow}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.productMeta}>
                      <Text style={styles.productPrice}>
                        {Number(item.price).toLocaleString()} đ
                      </Text>
                      <Text style={styles.productQty}>
                        x{item.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Tóm tắt chi phí */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: "#FFF7ED" }]}>
                <Feather name="file-text" size={16} color="#F97316" />
              </View>
              <Text style={styles.cardTitle}>Chi tiết hóa đơn</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {subTotal.toLocaleString()} đ
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                +{shippingFee.toLocaleString()} đ
              </Text>
            </View>

            {serviceFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Phí dịch vụ</Text>
                <Text style={styles.summaryValue}>
                  +{serviceFee.toLocaleString()} đ
                </Text>
              </View>
            )}

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryText, { color: "#10B981" }]}>Mã giảm giá</Text>
                <Text style={[styles.summaryValue, { color: "#10B981", fontWeight: "600" }]}>
                  -{discountAmount.toLocaleString()} đ
                </Text>
              </View>
            )}

            <View style={styles.dashedDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {finalTotal.toLocaleString()} đ
              </Text>
            </View>
          </View>
        </ScrollView>
      </Content>
      <Footer>
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.orderButton} onPress={handleSend} activeOpacity={0.8}>
            <Text style={styles.orderButtonText}>Xác nhận đặt hàng</Text>
            <Feather name="check-circle" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </Footer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
  },
  introIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
  },
  introSub: {
    fontSize: 12,
    color: "#1E3A8A",
    opacity: 0.8,
    lineHeight: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  addressText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    fontWeight: "500",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "#F3F4F6",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "700",
  },
  productQty: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#EF4444",
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
  },
  orderButton: {
    backgroundColor: colors.blue_primary,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: colors.blue_primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  paymentText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
});

export default OrderInfo;
