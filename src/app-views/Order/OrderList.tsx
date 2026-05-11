import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { formatDate } from "@app-helper/utilities";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import { useRoute } from "@react-navigation/native";
import { getOrderListData, resetOrderListData } from "@redux/features/orderSlice";
import { AppDispatch, RootState } from "@redux/store";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet } from "react-native";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

interface OrderListProps {}

const OrderList: React.FC<OrderListProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const { trigger } = route?.params ?? {};
  const { goToOrderDetail } = useNavigationComponentApp();

  const { currentPagePaginationOrderListData, hasFetchedPaginationOrderListData, hasMorePaginationOrderListData, orderLoading, paginationOrderListData } =
    useSelector((state: RootState) => state.order, shallowEqual);
  const { tokenData } = useSelector((state: RootState) => state.auth, shallowEqual);

  const [refreshing, setRefreshing] = useState(false);
  const [triggerResetData, setTriggerResetData] = useState(false);

  useEffect(() => {
    if (trigger) dispatch(resetOrderListData());
  }, [trigger]);

  useEffect(() => {
    if (!hasFetchedPaginationOrderListData && !triggerResetData && tokenData) {
      dispatch(getOrderListData({ page: 1, limit: 10, token: tokenData }));
      setTriggerResetData(true);
    }
  }, [hasFetchedPaginationOrderListData, triggerResetData, tokenData]);

  const handleLoadMore = () => {
    if (hasMorePaginationOrderListData && !orderLoading && tokenData) {
      dispatch(getOrderListData({ page: currentPagePaginationOrderListData, limit: 10, token: tokenData }));
    }
  };

  const onRefreshData = () => {
    setRefreshing(true);
    dispatch(resetOrderListData());
    setTriggerResetData(false);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => goToOrderDetail({ data: item })}>
      {/* Header: ID + Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <View style={[styles.statusBadge, item.payment_status === "paid" ? styles.paid : styles.unpaid]}>
          <Text style={[styles.statusText, item.payment_status === "paid" ? styles.paidText : styles.unpaidText]}>
            {item.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
          </Text>
        </View>
      </View>

      {/* Body: Info */}
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={styles.value}>{item.total_price}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái:</Text>
          <Text
            style={[
              styles.value,
              { color: item.order_status === "pending" ? "#F39C12" : "#3498DB", fontWeight: "600" },
            ]}
          >
            {item.order_status}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Địa chỉ:</Text>
          <Text style={[styles.value, { flexShrink: 1 }]}>{item.address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày đặt:</Text>
          <Text style={styles.value}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      {/* Footer Button */}
      <View style={styles.cardFooter}>
        <Text style={styles.detailButton}>Xem chi tiết</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container>
      <HeaderCustom
        title="Danh sách đơn hàng"
        isShowLeftButton={!!trigger}
        containerStyle={trigger ? { flexDirection: "row", justifyContent: "space-between" } : { padding: 10 }}
      />

      <FlatList
        data={paginationOrderListData || []}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16, gap: 12 }}
        renderItem={renderItem}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
  orderId: { fontSize: 16, fontWeight: "700", color: "#333" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  paid: { backgroundColor: "#D4F5DD" },
  unpaid: { backgroundColor: "#FFD6D6" },
  statusText: { fontSize: 12, fontWeight: "600" },
  paidText: { color: "green" },
  unpaidText: { color: "red" },
  cardBody: { borderTopWidth: 1, borderTopColor: "#F0F0F0", paddingTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 14, color: "#555" },
  value: { fontSize: 14, color: "#333", fontWeight: "500" },
  cardFooter: { marginTop: 12, alignItems: "center" },
  detailButton: {
    backgroundColor: colors.blue_primary,
    color: "#fff",
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});

export default OrderList;
