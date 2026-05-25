import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useNavigation } from "@react-navigation/native";

const StoreLanding = () => {
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const navigation = useNavigation<any>();

  const handleRegisterStore = async () => {
    if (!storeName || !address) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên quán và địa chỉ!");
      return;
    }

    const res = await useCallAPI({
      method: "POST",
      url: `${URL_API}/store/register`, // Nhớ update API này ở Backend
      data: { store_name: storeName, address },
    });

    if (res?.success) {
      Alert.alert(
        "Thành công",
        "Đăng ký mở quán thành công! Vui lòng đăng nhập lại để cập nhật quyền.",
      );
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký mở cửa hàng</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên quán"
        onChangeText={setStoreName}
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        onChangeText={setAddress}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegisterStore}>
        <Text style={styles.buttonText}>Gửi yêu cầu đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#F97316",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default StoreLanding;
