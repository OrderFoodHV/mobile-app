import React, { useEffect } from "react";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { Container, Content, Footer } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import { useRoute } from "@react-navigation/native";
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
  ActivityIndicator,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
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

  const calculateTotal = () => {
    return data?.total_price || 0;
  };

  const handleSend = () => {
    if (tokenData && data) {
      dispatch(createOrder({ data, token: tokenData }));
    }
  };

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

  return (
    <Container>
      <HeaderCustom
        title={"Thông tin đơn hàng"}
        rightIcon={<View style={{ flex: 1 }}></View>}
      />
      <Content>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Địa chỉ giao hàng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <Text style={styles.text}>{data?.address}</Text>
          </View>

          {/* Thông tin sản phẩm */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
            {data?.items?.map((product: any) => (
              <View key={product.id} style={styles.productContainer}>
                <Image
                  source={{ uri: product?.image }}
                  style={styles.productImage}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product?.name}</Text>
                  <Text style={styles.productPrice}>
                    {product?.price?.toLocaleString()}
                  </Text>
                  <Text style={styles.productQuantity}>
                    Số lượng: {product?.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Phương thức thanh toán */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[styles.paymentBtn, styles.paymentBtnActive]}>
                {data?.payment_method === 'vnpay' ? (
                  <>
                    <Feather name="credit-card" size={16} color={colors.blue_primary} />
                    <Text style={[styles.paymentText, styles.paymentTextActive]}>VNPay</Text>
                  </>
                ) : (
                  <>
                    <Feather name="dollar-sign" size={16} color={colors.blue_primary} />
                    <Text style={[styles.paymentText, styles.paymentTextActive]}>Tiền mặt</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Tổng tiền */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
            <View style={styles.priceRow}>
              <Text style={styles.text}>Tạm tính</Text>
              <Text style={styles.text}>{data?.total_price?.toLocaleString()}đ</Text>
            </View>
            {data?.store_voucher_id && (
              <View style={styles.priceRow}>
                <Text style={styles.text}>Mã khuyến mãi áp dụng</Text>
                <Text style={{color: '#10B981'}}>ID: {data.store_voucher_id}</Text>
              </View>
            )}
            <View style={[styles.priceRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }]}>
              <Text style={styles.sectionTitle}>Tổng tiền</Text>
              <Text style={styles.totalText}>
                {calculateTotal()?.toLocaleString()}đ
              </Text>
            </View>
          </View>
        </ScrollView>


      </Content>
      <Footer>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.orderButton} onPress={handleSend}>
            <Text style={styles.orderButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </Footer>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 14,
    color: "#e53935",
  },
  productQuantity: {
    fontSize: 14,
    marginTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53935",
  },
  footer: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  orderButton: {
    backgroundColor: colors.blue_primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, gap: 6 },
  paymentBtnActive: { borderColor: colors.blue_primary, backgroundColor: '#EFF6FF' },
  paymentText: { color: '#6B7280', fontWeight: '500' },
  paymentTextActive: { color: colors.blue_primary, fontWeight: 'bold' },
  voucherSelect: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#F59E0B', borderRadius: 8, backgroundColor: '#FEF3C7' },
  voucherText: { flex: 1, marginLeft: 10, color: '#D97706', fontWeight: '500' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  voucherCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 10 }
});

export default OrderInfo;
