import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../api/api";

export default function ProductDetail({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.log);
  }, [id]);

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      // 1. Dữ liệu chuẩn bị gửi đi (Phải CÓ name và price nhé)
      const newItem = {
        cart_id: 1, // Mặc định ID giỏ hàng của nick Việt (User 3) là 1
        product_id: product.id,
        name: product.name, // Rất quan trọng, thiếu là lỗi lúc mở giỏ hàng!
        price: product.price, // Rất quan trọng!
        quantity: quantity,
      };

      // 2. Gọi API thêm vào ĐÚNG mảng "cart_items"
      await API.post("/cart_items", newItem);

      alert("🎉 Đã thêm " + product.name + " vào giỏ hàng!");
    } catch (error) {
      console.log("Lỗi thêm giỏ hàng:", error);
      alert("Lỗi thêm món, sếp thử lại xem!");
    }
  };

  if (!product)
    return (
      <ActivityIndicator
        size="large"
        color="#FF6C22"
        style={{ flex: 1, marginTop: 50 }}
      />
    );

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `http://10.0.2.2:3000${product.image}` }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price?.toLocaleString()} VNĐ</Text>
        <Text style={styles.desc}>
          {product.description || "Món ăn siêu ngon, đậm đà hương vị!"}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  image: { width: "100%", height: 300, resizeMode: "cover" },
  content: { padding: 20, flex: 1 },
  name: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 10 },
  price: {
    fontSize: 22,
    color: "#FF6C22",
    fontWeight: "bold",
    marginBottom: 20,
  },
  desc: { fontSize: 16, color: "#666", lineHeight: 24 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#EEE",
    backgroundColor: "#FFF",
  },
  addBtn: {
    backgroundColor: "#FF6C22",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
