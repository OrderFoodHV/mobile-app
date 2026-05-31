import React, { useEffect } from "react";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { Content, Footer } from "@app-layout/Layout";
import { SafeAreaView } from "react-native-safe-area-context";
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
  console.log("datassss", JSON.stringify(data));

  const handleSend = () => {
    if (tokenData && data) {
      dispatch(createOrder({ data: data, token: tokenData }));
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

  // Tính dự phòng tổng tiền nếu bị khuyết cho hiển thị
  const fallbackTotal = data?.items?.reduce(
    (sum: number, item: any) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
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
            <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
            {data?.items?.map((item: any, index: number) => (
              <View key={index} style={styles.productContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>
                    Đơn giá: {Number(item.price).toLocaleString()} đ
                  </Text>
                  <Text style={styles.productQty}>
                    Số lượng: {item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tóm tắt chi phí */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng tiền</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {Number(data?.total_price || fallbackTotal).toLocaleString()} đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>0 đ</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalText}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {Number(data?.total_price || fallbackTotal).toLocaleString()} đ
              </Text>
            </View>
          </View>
        </ScrollView>
      </Content>
      <Footer>
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.orderButton} onPress={handleSend}>
            <Text style={styles.orderButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </Footer>
    </SafeAreaView>
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
  productQty: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryText: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: "#eee",
    marginTop: 8,
    paddingTop: 10,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
  },
  footerContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    width: "100%",
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
});

export default OrderInfo;
