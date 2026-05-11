import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import AppImage from "@app-uikits/AppImage";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Container, Content } from "@app-layout/Layout";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { getOrderItemsData, resetOrderItemsData } from "@redux/features/orderSlice";
import { AppDispatch, RootState } from "@redux/store";
import { useNavigationServices } from "@app-helper/navigateToScreens";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Hoàn thành",
  cancelled: "Đã hủy",
};

const OrderDetail: React.FC = () => {
  const route = useRoute<any>();
  const { data } = route.params ?? {};
  const dispatch = useDispatch<AppDispatch>();
  const { goToBack, replaceScreen } = useNavigationServices();
  const { tokenData } = useSelector((state: RootState) => state.auth, shallowEqual);
  const {
    currentPagePaginationOrderItemsData,
    hasMorePaginationOrderItemsData,
    hasFetchedPaginationOrderItemsData,
    orderLoading,
    paginationOrderItemsData,
  } = useSelector((state: RootState) => state.order, shallowEqual);

  const [order, setOrder] = useState<any>(data);
  const [refreshing, setRefreshing] = useState(false);
  const [triggerResetData, setTriggerResetData] = useState(false);

  const currentStepIndex = STATUS_STEPS.indexOf(order?.order_status);

  useEffect(() => {
    if (!triggerResetData && data?.id && tokenData) {
      dispatch(resetOrderItemsData());
      dispatch(
        getOrderItemsData({
          page: 1,
          limit: 10,
          filterColumn: "order_id",
          filterValue: data?.id,
          token: tokenData,
        }),
      );
      setTriggerResetData(true);
    }
  }, [triggerResetData, data, tokenData, dispatch]);

  useEffect(() => {
    if (hasFetchedPaginationOrderItemsData && Array.isArray(paginationOrderItemsData) && paginationOrderItemsData.length > 0) {
      setOrder((prev: any) => ({
        ...prev,
        ...paginationOrderItemsData[0],
      }));
    }
  }, [hasFetchedPaginationOrderItemsData, paginationOrderItemsData]);

  const handleLoadMore = () => {
    if (
      currentPagePaginationOrderItemsData > 1 &&
      hasMorePaginationOrderItemsData &&
      !orderLoading &&
      data?.id &&
      tokenData
    ) {
      dispatch(
        getOrderItemsData({
          page: currentPagePaginationOrderItemsData,
          limit: 10,
          filterColumn: "order_id",
          filterValue: data?.id,
          token: tokenData,
        }),
      );
    }
  };

  const onRefreshData = () => {
    if (!orderLoading) {
      setRefreshing(true);
      setTriggerResetData(false);
      dispatch(resetOrderItemsData());
      setRefreshing(false);
    }
  };

  const handleCancel = () => setOrder({ ...order, order_status: "cancelled" });
  const handleNextStatus = () => {
    if (currentStepIndex < STATUS_STEPS.length - 1) {
      setOrder({ ...order, order_status: STATUS_STEPS[currentStepIndex + 1] });
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <AppImage source={{ uri: item?.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item?.name}</Text>
        <Text style={styles.productDesc}>{item?.description}</Text>
        <Text>Số lượng: {item?.quantity}</Text>
        <Text>Giá: {item?.price} đ</Text>
        <Text style={styles.productTotal}>Thành tiền: {item?.total_price} đ</Text>
      </View>
    </View>
  );

  return (
    <Container>
      <HeaderCustom
        title="Chi tiết đơn hàng"
        onPressLeft={data?.trigger ? () => replaceScreen("BottomContainer") : () => goToBack()}
      />

      <Content style={styles.container}>
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.progressContainer}>
            {STATUS_STEPS.map((status, index) => {
              const isActive = index <= currentStepIndex;

              return (
                <View key={status} style={styles.progressStep}>
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor:
                          order?.order_status === "cancelled"
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
                        color:
                          order?.order_status === "cancelled"
                            ? "#EF4444"
                            : isActive
                              ? "#111827"
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
                          backgroundColor:
                            order?.order_status === "cancelled"
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

        <View style={styles.orderCard}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Mã đơn: </Text>#{order?.id}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Địa chỉ: </Text>
            {order?.address}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Thanh toán: </Text>
            {order?.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Trạng thái: </Text>
            {STATUS_LABELS[order?.order_status] || order?.order_status}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Tổng tiền: </Text>
            <Text style={styles.totalPrice}>{order?.total_price} đ</Text>
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Ngày đặt: </Text>
            {order?.created_at ? new Date(order.created_at).toLocaleString() : ""}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Sản phẩm</Text>
        <FlatList
          data={paginationOrderItemsData || []}
          keyExtractor={(item, index) => item.product_id?.toString() || index.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.8}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={renderProduct}
        />

        <View style={styles.actions}>
          {order?.order_status === "pending" && (
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={handleCancel}>
              <Text style={styles.btnText}>Hủy đơn</Text>
            </TouchableOpacity>
          )}
          {order?.order_status !== "delivered" && order?.order_status !== "cancelled" && (
            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={handleNextStatus}>
              <Text style={styles.btnText}>Chuyển trạng thái tiếp theo</Text>
            </TouchableOpacity>
          )}
        </View>
      </Content>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  statusCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 },
  progressContainer: { flexDirection: "row", alignItems: "center" },
  progressStep: { alignItems: "center", flex: 1 },
  circle: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  circleText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  line: { flex: 1, height: 2, marginHorizontal: 4 },
  statusLabel: { fontSize: 12, marginTop: 4, textAlign: "center" },
  orderCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 },
  label: { fontWeight: "600" },
  infoText: { marginBottom: 6, fontSize: 14 },
  totalPrice: { color: "#EF4444", fontWeight: "700" },
  productCard: { flexDirection: "row", backgroundColor: "#fff", padding: 12, borderRadius: 12, elevation: 1 },
  productImage: { width: 90, height: 90, borderRadius: 12, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "700" },
  productDesc: { fontSize: 13, color: "#6B7280", marginVertical: 4 },
  productTotal: { fontWeight: "700", color: "#EF4444", marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 15, marginBottom: 15, gap: 10 },
  button: { flex: 1, paddingVertical: 10, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  cancelBtn: { backgroundColor: "#EF4444" },
  confirmBtn: { backgroundColor: "#3B82F6" },
  btnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
});

export default OrderDetail;
