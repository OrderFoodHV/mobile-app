import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import API from "../api/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Thêm state cho SĐT
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      return Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
    }

    try {
      // Gửi data lên Backend (Lưu ý: BE của sếp phải có cột phone trong bảng users nhé)
      await API.post("/auth/register", { name, email, password, phone });

      Alert.alert("Thành công", "Đăng ký tài khoản thành công!");
      navigation.navigate("Login");
    } catch (err) {
      console.log("Lỗi Đăng ký:", err.response?.data || err.message);
      Alert.alert(
        "Đăng ký thất bại",
        err.response?.data?.message || "Có lỗi xảy ra!",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dùng ScrollView để lỡ màn hình bé thì cuộn được, không bị che mất nút bấm */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>
          Bắt đầu đặt món ngon cùng InOrder! 🚀
        </Text>

        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên của bạn..."
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email (Tên đăng nhập)</Text>
        <TextInput
          style={styles.input}
          placeholder="ví dụ: viet@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric" // Hiện bàn phím số
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Tạo mật khẩu..."
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
          <Text style={styles.btnText}>Đăng ký ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Đã có tài khoản? Trở về Đăng nhập</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 20, justifyContent: "center", flexGrow: 1 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6C22",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: "#FF6C22",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  linkText: {
    textAlign: "center",
    color: "#FF6C22",
    marginTop: 25,
    fontSize: 16,
    fontWeight: "500",
  },
});
