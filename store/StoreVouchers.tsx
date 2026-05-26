import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { Container } from "../src/app-layout/Layout";
import colors from "../src/assets/colors/global_colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";

const StoreVouchers = () => {
  const navigation = useNavigation<any>();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const storeId = useSelector((state: any) => state.auth.account?.storeId) || 1;

  const fetchVouchers = async () => {
    if (!tokenData) return;
    setLoading(true);
    try {
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/vouchers`,
        token: tokenData,
      });
      const actualVouchers = res?.data || res;
      if (res && Array.isArray(actualVouchers)) setVouchers(actualVouchers);
    } catch (error) {
      console.log("Lỗi lấy voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [tokenData, storeId]);

  const toggleStatus = async (voucherId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setVouchers(
      vouchers.map((v) =>
        v.id === voucherId ? { ...v, status: newStatus } : v,
      ),
    );
    try {
      await useCallAPI({
        method: "PUT",
        url: `${URL_API}/store/${storeId}/vouchers/${voucherId}/toggle`,
        token: tokenData,
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thay đổi trạng thái");
      fetchVouchers();
    }
  };

  const handleDelete = (voucherId: number) => {
    Alert.alert("Xác nhận xóa", "Xóa mã giảm giá này vĩnh viễn?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await useCallAPI({
              method: "DELETE",
              url: `${URL_API}/store/${storeId}/vouchers/${voucherId}`,
              token: tokenData,
            });
            fetchVouchers();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa");
          }
        },
      },
    ]);
  };

  const renderVoucher = ({ item }: { item: any }) => (
    <View
      style={[styles.card, item.status === "inactive" && styles.cardDisabled]}
    >
      <View style={styles.cardLeft}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {item.discount_type === "percent"
              ? `${item.discount_value}%`
              : `-${item.discount_value / 1000}k`}
          </Text>
        </View>
      </View>
      <View style={styles.cardCenter}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={styles.desc}>
          Đơn tối thiểu{" "}
          {Number(item.min_order_amount || 0).toLocaleString("vi-VN")}đ
        </Text>
        <Text style={styles.date}>
          HSD: {new Date(item.end_date).toLocaleDateString("vi-VN")}
        </Text>
      </View>
      <View style={styles.actionCol}>
        <Switch
          trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
          thumbColor={item.status === "active" ? "#10B981" : "#f4f3f4"}
          value={item.status === "active"}
          onValueChange={() => toggleStatus(item.id, item.status)}
        />
        <TouchableOpacity
          style={{ marginTop: 12, padding: 4 }}
          onPress={() => handleDelete(item.id)}
        >
          <Feather name="trash-2" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Container style={{ backgroundColor: "#F3F4F6" }}>
      <View style={styles.headerCustom}>
        <HeaderApp
          title="Mã Khuyến Mãi"
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
        />
        <TouchableOpacity onPress={fetchVouchers} style={{ padding: 10 }}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.blue_primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVoucher}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Chưa có mã giảm giá nào.</Text>
          )}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  headerCustom: {
    backgroundColor: colors.blue_primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  cardDisabled: { backgroundColor: "#F9FAFB", opacity: 0.7 },
  cardLeft: { justifyContent: "center", marginRight: 12 },
  discountBadge: {
    backgroundColor: "#FEF2F2",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  discountText: { color: "#EF4444", fontWeight: "bold", fontSize: 16 },
  cardCenter: { flex: 1, justifyContent: "center" },
  code: { fontSize: 16, fontWeight: "bold", color: "#1F2937", marginBottom: 4 },
  desc: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  date: { fontSize: 12, color: "#9CA3AF" },
  actionCol: { justifyContent: "center", alignItems: "flex-end" },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 50 },
});

export default StoreVouchers;
