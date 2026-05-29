import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { Container } from "../src/app-layout/Layout";
import colors from "../src/assets/colors/global_colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";
import { resetProductTypeAll } from "../src/redux/features/productListSlice";

const resolveImageUrl = (uri: string): string => {
  if (!uri || typeof uri !== 'string') return '';
  if (uri.includes('/uploads/')) {
    const filename = uri.split('/uploads/').pop();
    if (filename) {
      return `${URL_API}/uploads/${filename}`;
    }
  }
  return uri;
};

const StoreProducts = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const storeId = useSelector((state: any) => state.auth.account?.storeId) || 1;

  const fetchProducts = async () => {
    if (!tokenData) return;
    setLoading(true);
    try {
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/products`,
        token: tokenData,
      });
      const actualProducts = res?.data || res;
      if (res && Array.isArray(actualProducts)) {
        setProducts(actualProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log(
        "Lỗi lấy thực đơn:",
        error,
      );
      setProducts([]); // Cơ chế bảo vệ phòng khi sập mạng
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => fetchProducts());
    return unsubscribe;
  }, [navigation, tokenData, storeId]);

  const toggleAvailability = async (
    productId: number,
    currentStatus: number,
  ) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, available: currentStatus ? 0 : 1 } : p,
      ),
    );
    try {
      await useCallAPI({
        method: "PUT",
        url: `${URL_API}/store/${storeId}/products/${productId}/toggle`,
        token: tokenData,
      });
    } catch (error) {
      console.log("Lỗi đồng bộ trạng thái mở bán lên server");
    }
  };

  const handleDelete = (productId: number) => {
    Alert.alert("Xác nhận xóa", "Sếp có chắc muốn xóa vĩnh viễn món này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await useCallAPI({
              method: "DELETE",
              url: `${URL_API}/store/${storeId}/products/${productId}`,
              token: tokenData,
            });
            setProducts(products.filter((p) => p.id !== productId));
            dispatch(resetProductTypeAll());
            Alert.alert("Thành công", "Đã xóa món ăn khỏi thực đơn!");
          } catch (e) {
            console.log("Lỗi xóa món ăn:", e);
            Alert.alert("Lỗi", "Không thể xóa món ăn khỏi server.");
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View
      style={[styles.productCard, item.available === 0 && styles.cardDisabled]}
    >
      <Image
        source={
          item.image &&
          !item.image.includes("via.placeholder.com") &&
          !item.image.includes("placeholder")
            ? { uri: resolveImageUrl(item.image) }
            : require("../src/assets/images/default_food.png")
        }
        style={[styles.productImage, item.available === 0 && { opacity: 0.5 }]}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>
          {item.category_name || "Món ăn"}
        </Text>
        <Text style={styles.productPrice}>
          {Number(item.price).toLocaleString("vi-VN")} đ
        </Text>
      </View>
      <View style={styles.actionCol}>
        <Switch
          trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
          thumbColor={item.available ? "#10B981" : "#f4f3f4"}
          value={item.available === 1}
          onValueChange={() => toggleAvailability(item.id, item.available)}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              navigation.navigate("StoreProductForm", { product: item })
            }
          >
            <Feather name="edit-2" size={18} color={colors.blue_primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Container style={{ backgroundColor: "#F3F4F6" }}>
      <View style={styles.headerCustom}>
        <HeaderApp title="Quản lý Thực đơn" />
        <TouchableOpacity onPress={fetchProducts} style={{ padding: 10 }}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => navigation.navigate("StoreProductForm")}
      >
        <Feather name="plus" size={28} color="white" />
      </TouchableOpacity>
    </Container>
  );
};

const styles = StyleSheet.create({
  headerCustom: {
    backgroundColor: colors.blue_primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  cardDisabled: { backgroundColor: "#F9FAFB" },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  productInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  productCategory: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  productPrice: { fontSize: 15, fontWeight: "bold", color: "#EF4444" },
  actionCol: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 4,
  },
  btnRow: { flexDirection: "row", gap: 12 },
  iconBtn: { padding: 4 },
  fabBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: colors.blue_primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default StoreProducts;
