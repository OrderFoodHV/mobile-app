import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";

import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { Container } from "../src/app-layout/Layout";
import colors from "../src/assets/colors/global_colors";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";

const StoreProductForm = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Kiểm tra xem là Đang Sửa món cũ hay Thêm món mới
  const editProduct = route.params?.product;

  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [storeId] = useState<number>(1);

  // Các trường dữ liệu của món ăn
  const [name, setName] = useState(editProduct?.name || "");
  const [price, setPrice] = useState(
    editProduct?.price ? editProduct.price.toString() : "",
  );
  const [image, setImage] = useState(
    editProduct?.image || editProduct?.image_url || "",
  );
  const [desc, setDesc] = useState(editProduct?.description || "");
  const [categoryId, setCategoryId] = useState(
    editProduct?.category_id?.toString() || "1",
  ); // Mặc định là Snacks (1)

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert(
        "Thiếu thông tin",
        "Sếp ơi điền ít nhất Tên món và Giá tiền nhé!",
      );
      return;
    }

    setLoading(true);
    const payload = {
      name,
      price: Number(price),
      image: image || "https://via.placeholder.com/150", // Nếu không điền link ảnh thì lấy ảnh mặc định
      description: desc,
      category_id: Number(categoryId),
      available: 1, // Mặc định mở bán
    };

    try {
      if (editProduct) {
        // CẬP NHẬT MÓN CŨ
        await useCallAPI({
          method: "PUT",
          url: `${URL_API}/store/${storeId}/products/${editProduct.id}`,
          token: tokenData,
          payload,
        });
        Alert.alert("Thành công", "Đã cập nhật món ăn!");
      } else {
        // THÊM MÓN MỚI
        await useCallAPI({
          method: "POST",
          url: `${URL_API}/store/${storeId}/products`,
          token: tokenData,
          payload,
        });
        Alert.alert("Thành công", "Đã thêm món ăn mới vào Menu!");
      }
      navigation.goBack(); // Quay lại trang Thực đơn
    } catch (error) {
      console.log("Lỗi lưu sản phẩm:", error);
      Alert.alert(
        "Lỗi",
        "Không thể lưu sản phẩm. Sếp xem lại token (Đăng nhập lại) xem sao nhé.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ backgroundColor: "#F9FAFB" }}>
      <HeaderApp
        title={editProduct ? "Sửa món ăn" : "Thêm món mới"}
        leftIcon="arrow-left"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.label}>
            Tên món ăn <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="VD: Cơm chiên dương châu..."
          />

          <Text style={styles.label}>
            Giá bán (VNĐ) <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="VD: 45000"
          />

          <Text style={styles.label}>
            Danh mục (1: Ăn vặt, 2: Đồ ăn nhanh, 3: Đồ uống)
          </Text>
          <TextInput
            style={styles.input}
            value={categoryId}
            onChangeText={setCategoryId}
            keyboardType="numeric"
            placeholder="Nhập số 1, 2 hoặc 3"
          />

          <Text style={styles.label}>
            Link Ảnh (Copy link từ Google Images dán vào đây)
          </Text>
          <TextInput
            style={styles.input}
            value={image}
            onChangeText={setImage}
            placeholder="https://..."
          />
          {/* Xem trước ảnh nếu có link */}
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImg} />
          ) : null}

          <Text style={styles.label}>Mô tả món ăn</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
            value={desc}
            onChangeText={setDesc}
            multiline
            placeholder="Mô tả sự hấp dẫn của món ăn..."
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Feather
            name="save"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveBtnText}>
            {loading ? "Đang xử lý..." : "Lưu Sản Phẩm"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 20,
  },
  label: { fontSize: 14, color: "#4B5563", marginBottom: 8, fontWeight: "600" },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 16,
  },
  previewImg: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#E5E7EB",
    resizeMode: "cover",
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: colors.blue_primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default StoreProductForm;
