import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
// Giữ nguyên import useCallAPI, khi nào có API thì dùng
import useCallAPI from "src/app-helper/useCallAPI";
import URL_API from "src/app-helper/urlAPI";
import { updateAuthInfor } from "src/redux/features/authSlice";

const StoreSettings: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  // Sếp hay dùng chữ name hoặc user_name, tớ hứng cả 2 cho chắc cốp
  const user = useSelector((state: any) => state.auth.account);
  const tokenData = useSelector((state: any) => state.auth.tokenData);

  const [name, setName] = useState(user?.name || user?.user_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = () => {
    if (!name || !phone || !address) {
      Alert.alert("Lỗi", "Vui lòng điền đủ thông tin!");
      return;
    }
    setLoading(true);

    /* Tạm thời khóa gọi API để FE tự chạy mượt
    try {
      const res = await useCallAPI({
        method: "PUT",
        url: `${URL_API}/store/profile`, 
        token: tokenData,
        data: { name, phone, address }
      });
    } catch (error) { console.log(error) }
    */

    setTimeout(() => {
      // 🌟 ÉP REDUX CẬP NHẬT TRỰC TIẾP
      dispatch(
        updateAuthInfor({
          name: name, // Push name lên Redux
          user_name: name, // Đẩy luôn user_name đề phòng các màn hình khác gọi
          phone: phone,
          address: address,
        }),
      );

      setLoading(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin cửa hàng!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }, 600); // Demo loading 0.6s cho mượt
  };

  const handleDeleteAccount = () => {
    Alert.alert("Xóa tài khoản", "Dữ liệu sẽ mất vĩnh viễn?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => console.log("Xóa API..."),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt cửa hàng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Thông tin cửa hàng</Text>
          <Text style={styles.label}>Tên cửa hàng</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
        >
          <Feather
            name="trash-2"
            size={20}
            color="#EF4444"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.deleteText}>Xóa tài khoản cửa hàng</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { paddingRight: 15 },
  headerTitle: { color: "#ffffff", fontSize: 20, fontWeight: "bold" },
  container: { padding: 16 },
  formCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#4B5563", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deleteBtn: {
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  deleteText: { color: "#EF4444", fontWeight: "bold", fontSize: 16 },
});
export default StoreSettings;
