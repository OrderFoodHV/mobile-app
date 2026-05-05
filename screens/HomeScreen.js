import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Dùng bản xịn để hết báo lỗi
import API from "../api/api";

export default function Home({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, []);

  const addToCart = async (id) => {
    try {
      await API.post("/carts/add", { product_id: id, quantity: 1 });
      alert("Đã thêm vào giỏ!");
    } catch (error) {
      alert("Lỗi thêm giỏ hàng");
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FF6C22" style={{ flex: 1 }} />
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header mới: Có nút Tài khoản và Giỏ hàng */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>InOrder Menu 🍔</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.profileText}>👤</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.cartText}>🛒 Giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // Xử lý link ảnh an toàn, loại bỏ dấu gạch chéo thừa ở đầu nếu có
          const imageUrl = item.image
            ? `http://172.20.10.2:3000/${item.image.replace(/^\//, "")}`
            : "https://via.placeholder.com/100";

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("ProductDetail", { id: item.id })
              }
            >
              <Image source={{ uri: imageUrl }} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>

                {/* Dùng parseInt để ép về số nguyên, mất hẳn đuôi .00 */}
                <Text style={styles.price}>
                  {parseInt(item.price).toLocaleString("vi-VN")} VNĐ
                </Text>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(item.id)}
                >
                  <Text style={styles.addText}>+ Thêm</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingHorizontal: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  headerActions: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  profileButton: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  profileText: { fontSize: 16 },
  cartButton: { backgroundColor: "#FF6C22", padding: 10, borderRadius: 8 },
  cartText: { color: "#FFF", fontWeight: "bold" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 3,
  },
  image: { width: 100, height: 100, backgroundColor: "#E0E0E0" },
  info: { flex: 1, padding: 10, justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  price: { fontSize: 14, color: "#FF6C22", fontWeight: "600" },
  addButton: {
    backgroundColor: "#FFECDF",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  addText: { color: "#FF6C22", fontWeight: "bold" },
});
