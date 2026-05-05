import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../api/api";

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = () => {
    API.get("/cart_items")
      .then((res) => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Tính tổng tiền tự động
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
    0,
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FF6C22" style={{ flex: 1 }} />
    );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>Giỏ hàng đang trống 😢</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) =>
              item?.product_id?.toString() || Math.random().toString()
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {item?.name || "Sản phẩm không tên"}
                  </Text>
                  <Text style={styles.price}>
                    {(item?.price || 0).toLocaleString()} VNĐ x{" "}
                    {item.quantity || 0}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {(
                    (item?.price || 0) * (item?.quantity || 0)
                  ).toLocaleString()}{" "}
                  VNĐ
                </Text>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalPrice}>
                {totalAmount.toLocaleString()} VNĐ
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate("Checkout", { totalAmount })}
            >
              <Text style={styles.checkoutText}>Tiến hành đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  emptyView: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#888" },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 },
  price: { fontSize: 14, color: "#666" },
  itemTotal: { fontSize: 16, fontWeight: "bold", color: "#FF6C22" },
  footer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#333" },
  totalPrice: { fontSize: 20, fontWeight: "bold", color: "#E53935" },
  checkoutBtn: {
    backgroundColor: "#FF6C22",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
