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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { Container, Content } from "../src/app-layout/Layout";
import colors from "../src/assets/colors/global_colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";
import { SafeAreaView } from "react-native-safe-area-context";

const StoreVouchers = () => {
  const navigation = useNavigation<any>();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discount_type: "percent",
    discount_value: "",
    quantity: "",
    min_order_amount: "0",
    start_date: "",
    end_date: "",
  });
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

  const handleAddVoucher = async () => {
    if (!newVoucher.code || !newVoucher.discount_value) {
      Alert.alert("Lỗi", "Vui lòng nhập mã và giá trị giảm");
      return;
    }
    try {
      await useCallAPI({
        method: "POST",
        url: `${URL_API}/store/${storeId}/vouchers`,
        token: tokenData,
        data: {
          code: newVoucher.code,
          discount_type: newVoucher.discount_type,
          discount_value: Number(newVoucher.discount_value),
          min_order_amount: Number(newVoucher.min_order_amount) || 0,
          start_date: newVoucher.start_date || new Date().toISOString().split("T")[0],
          end_date: newVoucher.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          usage_limit: Number(newVoucher.quantity) || 100,
        },
      });
      setShowAddModal(false);
      setNewVoucher({
        code: "",
        discount_type: "percent",
        discount_value: "",
        quantity: "",
        min_order_amount: "0",
        start_date: "",
        end_date: "",
      });
      fetchVouchers();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm khuyến mãi");
    }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <View style={styles.headerCustom}>
        <HeaderApp
          title="Mã Khuyến Mãi"
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
        />
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={{ padding: 10 }}>
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchVouchers} style={{ padding: 10 }}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
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

      {/* MODAL THÊM VOUCHER */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}><Text style={{color: 'red'}}>*</Text> Mã voucher</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder="SALE20"
                  value={newVoucher.code}
                  onChangeText={(txt) => setNewVoucher({...newVoucher, code: txt})}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Loại giảm giá</Text>
                <View style={styles.dropdownBox}>
                  <Text>{newVoucher.discount_type === 'percent' ? "Phần trăm (%)" : "Tiền mặt"}</Text>
                  <TouchableOpacity onPress={() => setNewVoucher({...newVoucher, discount_type: newVoucher.discount_type === 'percent' ? 'fixed' : 'percent'})}>
                    <Feather name="chevron-down" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}><Text style={{color: 'red'}}>*</Text> Giá trị</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder="20"
                  keyboardType="numeric"
                  value={newVoucher.discount_value}
                  onChangeText={(txt) => setNewVoucher({...newVoucher, discount_value: txt})}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}><Text style={{color: 'red'}}>*</Text> Số lượng</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder="100"
                  keyboardType="numeric"
                  value={newVoucher.quantity}
                  onChangeText={(txt) => setNewVoucher({...newVoucher, quantity: txt})}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
                <View style={styles.inputBoxWithIcon}>
                  <TextInput
                    style={{flex: 1}}
                    placeholder="Chọn thời điểm"
                    value={newVoucher.start_date}
                    onChangeText={(txt) => setNewVoucher({...newVoucher, start_date: txt})}
                  />
                  <Feather name="calendar" size={16} color="#9CA3AF" />
                </View>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputLabel}>Ngày kết thúc</Text>
                <View style={styles.inputBoxWithIcon}>
                  <TextInput
                    style={{flex: 1}}
                    placeholder="Chọn thời điểm"
                    value={newVoucher.end_date}
                    onChangeText={(txt) => setNewVoucher({...newVoucher, end_date: txt})}
                  />
                  <Feather name="calendar" size={16} color="#9CA3AF" />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Đơn tối thiểu</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="0"
              keyboardType="numeric"
              value={newVoucher.min_order_amount}
              onChangeText={(txt) => setNewVoucher({...newVoucher, min_order_amount: txt})}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleAddVoucher}>
                <Text style={styles.createBtnText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', padding: 0 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  formCol: { flex: 1 },
  inputLabel: { fontSize: 13, color: '#374151', marginBottom: 6 },
  inputBox: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937' },
  inputBoxWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24, marginBottom: 20 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFF' },
  cancelBtnText: { color: '#374151', fontWeight: '600' },
  createBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 6, backgroundColor: '#6366F1' },
  createBtnText: { color: '#FFF', fontWeight: '600' },
});

export default StoreVouchers;
