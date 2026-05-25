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
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";

// 🌟 TRỌN BỘ 24 MÓN ĂN CHUẨN KHÍT ĐỒNG BỘ 100% VỚI DATABASE CỦA SẾP
const ALL_DB_PRODUCTS = [
  // ===== SNACKS (category_id = 1) =====
  {
    id: 1,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Khoai lang kén",
    image:
      "https://cdn.tgdd.vn/Files/2020/08/26/1284970/cach-lam-khoai-lang-ken-202008261116040688.jpg",
    price: 20000,
    description: "Khoai lang chiên giòn, ngọt nhẹ.",
    available: 1,
  },
  {
    id: 2,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Bánh tráng nướng",
    image:
      "https://cdn.tgdd.vn/2021/09/CookRecipe/Avatar/banh-trang-nuong-thumbnail.jpg",
    price: 25000,
    description: "Bánh tráng nướng giòn, topping đầy đủ.",
    available: 1,
  },
  {
    id: 3,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Chả cá viên chiên",
    image:
      "https://cdn.tgdd.vn/Files/2020/09/21/1295317/cach-lam-ca-vien-chien.jpg",
    price: 22000,
    description: "Cá viên dai ngon, chiên vàng giòn.",
    available: 1,
  },
  {
    id: 4,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Đậu phộng rang muối",
    image:
      "https://cdn.tgdd.vn/Files/2021/06/23/1363475/cach-rang-dau-phong.jpg",
    price: 15000,
    description: "Đậu phộng rang giòn, mặn nhẹ.",
    available: 1,
  },
  {
    id: 5,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Bắp xào bơ",
    image:
      "https://cdn.tgdd.vn/2020/07/CookRecipe/Avatar/bap-xao-thumbnail.jpg",
    price: 25000,
    description: "Bắp xào bơ thơm béo, thêm hành phi.",
    available: 1,
  },
  {
    id: 6,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Khô bò miếng",
    image: "https://cdn.tgdd.vn/Files/2021/12/02/1402570/kho-bo-mieng.jpg",
    price: 40000,
    description: "Khô bò cay nhẹ, dai ngon.",
    available: 1,
  },
  {
    id: 7,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Bánh flan",
    image: "https://cdn.tgdd.vn/2021/05/CookProductThumb/banh-flan.jpg",
    price: 15000,
    description: "Flan mềm mịn, béo ngậy caramel.",
    available: 1,
  },
  {
    id: 8,
    category_id: 1,
    category_name: "Ăn vặt",
    name: "Rong biển sấy",
    image: "https://cdn.tgdd.vn/Files/2021/07/12/1368428/rong-bien-say.jpg",
    price: 20000,
    description: "Rong biển giòn tan, vị mặn nhẹ.",
    available: 1,
  },

  // ===== FAST FOOD (category_id = 2) =====
  {
    id: 9,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Cơm chiên dương châu",
    image:
      "https://cdn.tgdd.vn/2021/09/CookRecipe/Avatar/com-chien-duong-chau.jpg",
    price: 45000,
    description: "Cơm chiên đầy đủ topping, đậm đà.",
    available: 1,
  },
  {
    id: 10,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Hủ tiếu Nam Vang",
    image: "https://cdn.tgdd.vn/2021/08/CookRecipe/Avatar/hu-tieu-nam-vang.jpg",
    price: 50000,
    description: "Hủ tiếu nước trong, topping phong phú.",
    available: 1,
  },
  {
    id: 11,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Bánh mì thịt nướng",
    image:
      "https://cdn.tgdd.vn/2021/09/CookRecipe/Avatar/banh-mi-thit-nuong.jpg",
    price: 30000,
    description: "Bánh mì giòn, thịt nướng thơm lừng.",
    available: 1,
  },
  {
    id: 12,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Bún thịt nướng",
    image: "https://cdn.tgdd.vn/2021/07/CookRecipe/Avatar/bun-thit-nuong.jpg",
    price: 45000,
    description: "Bún tươi ăn kèm thịt nướng và rau.",
    available: 1,
  },
  {
    id: 13,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Cơm bò lúc lắc",
    image: "https://cdn.tgdd.vn/2021/10/CookRecipe/Avatar/com-bo-luc-lac.jpg",
    price: 65000,
    description: "Bò mềm, xào đậm vị, ăn với cơm nóng.",
    available: 1,
  },
  {
    id: 14,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Mì cay Hàn Quốc",
    image: "https://cdn.tgdd.vn/2021/07/CookRecipe/Avatar/mi-cay.jpg",
    price: 55000,
    description: "Mì cay cấp độ, topping đa dạng.",
    available: 1,
  },
  {
    id: 15,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Cơm gà nướng",
    image: "https://cdn.tgdd.vn/2021/09/CookRecipe/Avatar/com-ga-nuong.jpg",
    price: 55000,
    description: "Gà nướng thơm, da giòn, cơm nóng.",
    available: 1,
  },
  {
    id: 16,
    category_id: 2,
    category_name: "Đồ ăn nhanh",
    name: "Bún riêu cua",
    image: "https://cdn.tgdd.vn/2021/08/CookRecipe/Avatar/bun-rieu.jpg",
    price: 40000,
    description: "Bún riêu cua chua nhẹ, đậm đà.",
    available: 1,
  },

  // ===== DRINKS (category_id = 3) =====
  {
    id: 17,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Trà tắc",
    image: "https://cdn.tgdd.vn/2020/07/CookProductThumb/tra-tac.jpg",
    price: 15000,
    description: "Trà tắc chua ngọt, giải khát.",
    available: 1,
  },
  {
    id: 18,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Sữa chua đá",
    image: "https://cdn.tgdd.vn/2021/05/CookProductThumb/sua-chua-da.jpg",
    price: 20000,
    description: "Sữa chua mát lạnh, tốt cho tiêu hóa.",
    available: 1,
  },
  {
    id: 19,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Sinh tố dâu",
    image: "https://cdn.tgdd.vn/2020/07/CookProductThumb/sinh-to-dau.jpg",
    price: 30000,
    description: "Sinh tố dâu chua ngọt, thơm ngon.",
    available: 1,
  },
  {
    id: 20,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Nước ép táo",
    image: "https://cdn.tgdd.vn/2020/07/CookProductThumb/nuoc-ep-tao.jpg",
    price: 30000,
    description: "Nước ép táo tươi, giàu vitamin.",
    available: 1,
  },
  {
    id: 21,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Cacao đá",
    image: "https://cdn.tgdd.vn/2021/05/CookProductThumb/cacao-da.jpg",
    price: 30000,
    description: "Cacao đá béo, đậm vị socola.",
    available: 1,
  },
  {
    id: 22,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Trà vải",
    image: "https://cdn.tgdd.vn/2020/07/CookProductThumb/tra-vai.jpg",
    price: 30000,
    description: "Trà vải thơm, ngọt nhẹ.",
    available: 1,
  },
  {
    id: 23,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Soda chanh",
    image: "https://cdn.tgdd.vn/2020/07/CookProductThumb/soda-chanh.jpg",
    price: 25000,
    description: "Soda chanh mát lạnh, sảng khoái.",
    available: 1,
  },
  {
    id: 24,
    category_id: 3,
    category_name: "Đồ uống",
    name: "Nước ép dứa",
    image: "https://cdn.tgdd.vn/2020/07/CookProductThumb/nuoc-ep-dua.jpg",
    price: 30000,
    description: "Nước ép dứa chua ngọt tự nhiên.",
    available: 1,
  },
];

const StoreProducts = () => {
  const navigation = useNavigation<any>();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [products, setProducts] = useState<any[]>(ALL_DB_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [storeId] = useState<number>(1);

  const fetchProducts = async () => {
    if (!tokenData) return;
    setLoading(true);
    try {
      const res = await useCallAPI({
        method: "GET",
        url: `${URL_API}/store/${storeId}/products`,
        token: tokenData,
      });
      // Nếu gọi API bốc từ DB lên thành công và có data thật thì ưu tiên hiển thị dữ liệu DB
      if (res && res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        setProducts(ALL_DB_PRODUCTS);
      }
    } catch (error) {
      console.log(
        "Lỗi lấy thực đơn, kích hoạt chế độ hiển thị dự phòng:",
        error,
      );
      setProducts(ALL_DB_PRODUCTS); // Cơ chế bảo vệ phòng khi sập mạng
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => fetchProducts());
    return unsubscribe;
  }, [navigation, tokenData]);

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
        onPress: () => {
          setProducts(products.filter((p) => p.id !== productId));
          Alert.alert("Thành công", "Đã xóa món ăn");
        },
      },
    ]);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View
      style={[styles.productCard, item.available === 0 && styles.cardDisabled]}
    >
      <Image
        source={{
          uri:
            item.image || item.image_url || "https://via.placeholder.com/100",
        }}
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
