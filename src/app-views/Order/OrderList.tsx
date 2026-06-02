import React, { useEffect, useState } from "react";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { formatDate } from "@app-helper/utilities";
import colors from "@assets/colors/global_colors";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getOrderListData,
  resetOrderListData,
} from "@redux/features/orderSlice";
import { AppDispatch, RootState } from "@redux/store";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useAppTheme } from "src/app-context/ThemeContext";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import showToastApp from "@app-components/CustomToast/ShowToastApp";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  cooking: "Đang chế biến",
  processing: "Đang chế biến",
  shipping: "Đang giao hàng",
  delivering: "Đang giao hàng",
  delivered: "Hoàn thành",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const OrderList: React.FC = () => {
  const navigation = useNavigation<any>();
  const { themeColors } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const { trigger } = route?.params ?? {};
  const { goToOrderDetail } = useNavigationComponentApp();

  const {
    currentPagePaginationOrderListData,
    hasFetchedPaginationOrderListData,
    hasMorePaginationOrderListData,
    orderLoading,
    paginationOrderListData,
  } = useSelector((state: RootState) => state.order, shallowEqual);

  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const [refreshing, setRefreshing] = useState(false);

  // Lấy dữ liệu lần đầu
  useEffect(() => {
    if (!hasFetchedPaginationOrderListData && tokenData) {
      dispatch(getOrderListData({ page: 1, limit: 10, token: tokenData }));
    }
  }, [hasFetchedPaginationOrderListData, tokenData, dispatch]);

  const handleLoadMore = () => {
    if (hasMorePaginationOrderListData && !orderLoading && tokenData) {
      dispatch(
        getOrderListData({
          page: currentPagePaginationOrderListData,
          limit: 10,
          token: tokenData,
        }),
      );
    }
  };

  const onRefreshData = () => {
    setRefreshing(true);
    dispatch(resetOrderListData());
    if (tokenData) {
      dispatch(getOrderListData({ page: 1, limit: 10, token: tokenData }));
    }
    setRefreshing(false);
  };

  const [reorderLoadingId, setReorderLoadingId] = useState<number | null>(null);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => goToOrderDetail({ data: item })}
    >
      {/* Header: ID + Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            item.payment_status === "paid" ? styles.paid : styles.unpaid,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.payment_status === "paid"
                ? styles.paidText
                : styles.unpaidText,
            ]}
          >
            {item.payment_status === "paid"
              ? "Đã thanh toán"
              : "Chưa thanh toán"}
          </Text>
        </View>
      </View>

      {/* Body: Info */}
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={styles.value}>
            {Number(item.total_price).toLocaleString()} đ
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái:</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  (item.status || item.order_status) === "pending"
                    ? "#F39C12"
                    : "#3498DB",
                fontWeight: "600",
              },
            ]}
          >
            {STATUS_LABELS[item.status || item.order_status] ||
              item.status ||
              item.order_status}
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
        <TouchableOpacity style={styles.detailButton} onPress={() => goToOrderDetail({ data: item })}>
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
        {(item.status === "completed" || item.status === "cancelled" || item.order_status === "completed" || item.order_status === "cancelled") && (
          <TouchableOpacity 
            style={[styles.detailButton, { backgroundColor: "#F97316", marginLeft: 10 }]} 
            onPress={async () => {
              if (reorderLoadingId) return;
              setReorderLoadingId(item.id);
              try {
                const res = await useCallAPI({
                  method: "POST",
                  url: `${URL_API}/orders/${item.id}/reorder`,
                  token: tokenData,
                });
                if (res && res.products) {
                  navigation.navigate("Order", { products: res.products, type: "food" });
                }
              } catch (e) {
                console.log(e);
                showToastApp({ text: "Lỗi khi lấy thông tin đơn hàng cũ!", type: "error" });
              } finally {
                setReorderLoadingId(null);
              }
            }}
            disabled={reorderLoadingId !== null}
          >
            {reorderLoadingId === item.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.detailButtonText}>Đặt lại</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={paginationOrderListData || []}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshData} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          gap: 12,
        }}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.blue_primary || "#0284C7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 4,
  },
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  orderId: { fontSize: 16, fontWeight: "700", color: "#333" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  paid: { backgroundColor: "#D4F5DD" },
  unpaid: { backgroundColor: "#FFD6D6" },
  statusText: { fontSize: 12, fontWeight: "600" },
  paidText: { color: "green" },
  unpaidText: { color: "red" },
  cardBody: { borderTopWidth: 1, borderTopColor: "#F0F0F0", paddingTop: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontSize: 14, color: "#555" },
  value: { fontSize: 14, color: "#333", fontWeight: "500" },
  cardFooter: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" },
  detailButton: {
    backgroundColor: colors.blue_primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  detailButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default OrderList;
