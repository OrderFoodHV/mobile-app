import { Button, Text, View } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Welcome Food App 🍔
      </Text>

      <Button title="Đăng nhập" onPress={() => navigation.navigate("Login")} />
      <View style={{ height: 10 }} />
      <Button title="Đăng ký" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}
