import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import API from "../api/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      Alert.alert("Đăng ký thành công");

      // 👉 quay về login
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Lỗi", err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Register</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Button title="Đăng ký" onPress={handleRegister} />
    </View>
  );
}
