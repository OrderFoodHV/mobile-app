import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUser, removeToken, removeUser } from "../storage/token";

export default function ProfileScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);

  // Vừa vào trang là móc thông tin Khách hàng từ bộ nhớ ra hiển thị
  useEffect(() => {
    getUser().then((data) => {
      if (data) setUserInfo(data);
    });
  }, []);

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          await removeUser(); // Xóa sạch trí nhớ
          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tài khoản của tôi</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {/* Lấy chữ cái đầu của tên làm Avatar, cực kỳ tinh tế */}
            {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "👤"}
          </Text>
        </View>
        <Text style={styles.nameText}>
          {userInfo?.name || "Khách hàng InOrder"}
        </Text>
        <Text style={styles.emailText}>
          {userInfo?.email || "Chưa có email"}
        </Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Thành viên Đồng</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("OrderHistory")}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>Lịch sử đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => alert("Chức năng đang bảo trì!")}
        >
          <Text style={styles.menuIcon}>🎧</Text>
          <Text style={styles.menuText}>Hỗ trợ khách hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingHorizontal: 20 },
  header: { marginVertical: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  card: {
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 30,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#FFECDF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: { fontSize: 36, color: "#FF6C22", fontWeight: "bold" },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
  },
  emailText: { fontSize: 14, color: "#666", marginTop: 5 },
  roleBadge: {
    marginTop: 15,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { color: "#555", fontSize: 12, fontWeight: "600" },
  menuContainer: { gap: 15 },
  menuItem: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  menuIcon: { fontSize: 22, marginRight: 15 },
  menuText: { fontSize: 16, fontWeight: "600", color: "#444" },
  logoutButton: {
    backgroundColor: "#FFEBEB",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 1,
  },
  logoutText: { fontSize: 16, fontWeight: "bold", color: "#E53935" },
});
