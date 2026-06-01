import React, { useState } from "react"; // 1. Phải có React, useState
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";

const ShipperLanding = () => {
  const navigation = useNavigation<any>();
  const [vehicle, setVehicle] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Validate dữ liệu
    if (!vehicle.trim() || !phone.trim()) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ loại xe và số điện thoại để đăng ký.",
      );
      return;
    }

    // 2. Gọi API đăng ký
    setLoading(true);
    const res = await useCallAPI({
      method: "POST",
      url: `${URL_API}/shippers/register`, // Route API đã chuẩn sau khi bỏ /api
      data: { vehicle, phone },
    });
    setLoading(false);

    // 3. Xử lý kết quả
    // 3. Xử lý kết quả
    if (res?.success) {
      Alert.alert(
        "Đăng ký thành công! 🎉",
        "Đang chuyển hướng vào Kênh Tài Xế...",
        [
          {
            text: "Vào Kênh Tài Xế ngay",
            onPress: () => {
              // Thay vì goBack(), mình cho nó bay thẳng vào Kênh Shipper luôn
              navigation.navigate("ShipperBottomContainer");
            },
          },
        ],
      );
    } else {
      Alert.alert(
        "Đăng ký thất bại",
        res?.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.headerContainer}>
        {/* Nếu sếp có logo, thay require('./logo.png') vào source nhé, tạm thời tớ để View */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>🏍️</Text>
        </View>
        <Text style={styles.title}>Trở thành đối tác tài xế</Text>
        <Text style={styles.subtitle}>
          Cùng InOrder mang bữa ăn ngon đến mọi nhà!
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>
          Loại xe của bạn (VD: Honda Wave, 29H1-123.45)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập loại xe và biển số..."
          placeholderTextColor="#9ca3af"
          value={vehicle}
          onChangeText={setVehicle}
        />

        <Text style={styles.label}>Số điện thoại liên hệ</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại..."
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký ngay</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Màu nền xám nhạt cho sang trọng
  },
  headerContainer: {
    backgroundColor: "#F97316", // Màu cam chủ đạo
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFedd5",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
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
  button: {
    backgroundColor: "#F97316",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#FCA5A5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ShipperLanding;
