import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { storeToken, storeUser } from "../storage/token";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin!");

    // =================================================================
    // ✅ ĐOẠN NÀY ĐÃ BYPASS ĐỂ CHẠY MOCK API
    // =================================================================
    try {
      // Giả lập thông tin nick Việt (ID 3) từ db.json
      const fakeUser = {
        id: 3,
        name: "Việt",
        email: "viet@gmail.com",
        role: "customer",
      };
      const fakeToken = "token_gia_lap_123456";

      // Lưu vào máy để các màn hình sau lấy ra dùng
      await storeToken(fakeToken);
      await storeUser(fakeUser);

      Alert.alert("Test Mock API", "Đăng nhập giả lập thành công!");
      navigation.replace("Home"); // Nhớ check xem tên màn hình có đúng là "Home" không nhé
    } catch (error) {
      console.log("Lỗi lưu Storage:", error);
      Alert.alert("Lỗi", "Không lưu được thông tin đăng nhập!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>
          Cùng InOrder lấp đầy chiếc bụng đói! 🍔
        </Text>

        <Text style={styles.label}>Tên đăng nhập (Email)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: viet@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu..."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 20, justifyContent: "center", flex: 1 },
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
/* const handleLogin = async () => {

    if (!email || !password)

      return Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin!");



    // =================================================================

    // 🚧 TẠM THỜI COMMENT ĐOẠN NÀY LẠI KHI DÙNG MOCK API (JSON-SERVER)

    // =================================================================

    /*

    try {

      const res = await API.post("/auth/login", { email, password });

      console.log("KẾT QUẢ TỪ BACKEND:", JSON.stringify(res.data, null, 2));

      const token = res.data.access_token;



      if (token) {

        await storeToken(token);

        await storeUser(res.data.user);

        Alert.alert("Thành công", "Đăng nhập thành công!");

        navigation.replace("Home");

      } else {

        Alert.alert("Lỗi", "Không nhận được Token từ Server!");

      }

    } catch (err) {

      const errorData = err.response?.data;

      console.log("Lỗi Login từ BE:", errorData || err.message);



      Alert.alert(

        "Đăng nhập thất bại",

        errorData?.message || "Sai email, mật khẩu hoặc server chưa bật!",

      );

    }

    */

// =================================================================

// ✅ MỞ KHÓA ĐOẠN DƯỚI NÀY ĐỂ ĐI THẲNG VÀO TRONG APP

// =================================================================

/* try {

      // Ép cứng thông tin nick Việt (ID 3) giống hệt trong file db.json

      const fakeUser = {

        id: 3,

        name: "Việt",

        email: "viet@gmail.com",

        role: "customer"

      };

      const fakeToken = "token_gia_lap_de_test_mock_api_123456";



      // Vẫn lưu vào Storage để các màn hình khác (Home, Cart) lấy ra dùng bình thường

      await storeToken(fakeToken);

      await storeUser(fakeUser);



      Alert.alert("Test Mock API", "Đã vượt rào Đăng nhập thành công!");

      navigation.replace("Home"); // Đá thẳng vào trang chủ

    } catch (error) {

      console.log("Lỗi lưu Storage:", error);

    }

  }; */
