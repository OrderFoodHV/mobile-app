import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  // bạn hay dùng chữ name hoặc user_name, tớ hứng cả 2 cho chắc cốp
  const user = useSelector((state: any) => state.auth.account);
  const tokenData = useSelector((state: any) => state.auth.tokenData);

  const [name, setName] = useState(user?.storeName || user?.name || user?.user_name || "");
  const [phone, setPhone] = useState(user?.storePhone || user?.phone || "");
  const [address, setAddress] = useState(user?.storeAddress || user?.address || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name || !phone || !address) {
      Alert.alert("Lỗi", "Vui lòng điền đủ thông tin!");
      return;
    }
    setLoading(true);

    try {
      const res = await useCallAPI({
        method: "PUT",
        url: `${URL_API}/store/profile`,
        token: tokenData,
        data: { name, phone, address },
      });

      if (res?.success) {
        dispatch(
          updateAuthInfor({
            name: user?.name, // Giữ nguyên tên user
            storeName: name, // Push tên quán lên Redux
            storePhone: phone, // Push SĐT quán lên Redux
            storeAddress: address, // Cập nhật địa chỉ quán
          }),
        );

        Alert.alert("Thành công", "Đã cập nhật thông tin cửa hàng thành công!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(
          "Lỗi",
          res?.message || "Không thể cập nhật thông tin cửa hàng.",
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể kết nối máy chủ để cập nhật.");
    } finally {
      setLoading(false);
    }
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
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
      </KeyboardAvoidingView>
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
