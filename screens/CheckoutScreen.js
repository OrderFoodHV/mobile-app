import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../api/api";

export default function CheckoutScreen({ navigation, route }) {
  // Nhận tổng tiền từ màn Giỏ hàng truyền sang
  const { totalAmount = 0 } = route.params || {};
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckoutCOD = async () => {
    if (!address.trim()) {
      return Alert.alert("Lỗi", "chưa nhập địa chỉ giao hàng !");
    }

    setLoading(true);
    try {
      // Gọi API tạo đơn hàng xuống Backend
      const res = await API.post("/orders", {
        user_id: 3, // Phải gửi ID user (ví dụ nick Việt là 3)
        store_id: 1, // Đặt từ cửa hàng số 1
        address: address,
        payment_method: "COD",
        payment_status: "unpaid",
        status: "pending", // Đơn mới đang chờ xử lý
        total_price: totalAmount, // BẮT BUỘC gửi tổng tiền để Mock API lưu lại
        created_at: new Date().toISOString(), // Giờ tạo đơn
      });

      Alert.alert("Thành công 🎉", "Đã chốt đơn ngon lành!");

      // Đặt xong thì đá thẳng sang màn Lịch sử đơn hàng để xem luôn
      navigation.replace("OrderHistory");
    } catch (err) {
      console.log("Lỗi tạo đơn hàng:", err.response?.data || err.message);
      Alert.alert(
        "Tạo đơn thất bại",
        err.response?.data?.message || " kiểm tra lại code Mock Api nhé!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Xác nhận & Thanh toán</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📍 Địa chỉ nhận hàng:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: KTX K1, Đại học Xây Dựng..."
          value={address}
          onChangeText={setAddress}
          multiline
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Tổng thanh toán:</Text>
        <Text style={styles.totalText}>
          {totalAmount.toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF6C22"
          style={{ marginTop: 20 }}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.codButton}
            onPress={handleCheckoutCOD}
          >
            <Text style={styles.codText}>
              💵 Thanh toán khi nhận hàng (COD)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.vnpayButton}
            onPress={() => alert("Tính năng VNPay đang bảo trì chờ ghép nối!")}
          >
            <Text style={styles.vnpayText}>💳 Thanh toán qua VNPay</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingHorizontal: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    minHeight: 80,
    textAlignVertical: "top",
  },
  summaryCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryText: { fontSize: 16, color: "#666", fontWeight: "600" },
  totalText: { fontSize: 22, fontWeight: "bold", color: "#E53935" },
  codButton: {
    backgroundColor: "#FF6C22",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  codText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  vnpayButton: {
    backgroundColor: "#005BAA",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#005BAA",
  },
  vnpayText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
