import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSelector, shallowEqual, useDispatch } from "react-redux";

import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { Container } from "../src/app-layout/Layout";
import colors from "../src/assets/colors/global_colors";
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";
import { resetProductTypeAll } from "../src/redux/features/productListSlice";

const StoreProductForm = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Kiểm tra xem là Đang Sửa món cũ hay Thêm món mới
  const editProduct = route.params?.product;

  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const storeId = useSelector((state: any) => state.auth.account?.storeId) || 1;

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

  const [categories, setCategories] = useState<any[]>([]);
  const [categorySearchText, setCategorySearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/products/categories`,
          token: tokenData,
        });
        let categoryList = [];
        if (res && res.status === "success" && Array.isArray(res.data)) {
          categoryList = res.data;
        } else if (Array.isArray(res)) {
          categoryList = res;
        }
        setCategories(categoryList);
        // Nếu đang sửa món, gán text tìm kiếm ban đầu theo tên danh mục
        if (editProduct && editProduct.category_id) {
          const found = categoryList.find(
            (cat: any) => cat.id === Number(editProduct.category_id)
          );
          if (found) {
            setCategorySearchText(found.name);
            setCategoryId(found.id.toString());
          }
        }
      } catch (err) {
        console.log("Lỗi tải danh mục:", err);
      }
    };
    loadCategories();
  }, [editProduct, tokenData]);


  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Ứng dụng cần quyền truy cập thư viện ảnh để tải ảnh món ăn!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      uploadImage(selectedImageUri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1] || "jpeg";

      const formData = new FormData();
      formData.append("image", {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: `photo-${Date.now()}.${fileType}`,
        type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
      } as any);

      // Gọi cổng /upload ở gốc domain của API
      const res = await useCallAPI({
        method: "POST",
        url: `${URL_API.replace(/\/api$/, "")}/upload`,
        data: formData,
        token: tokenData,
        typeHeaders: "multipart/form-data",
      });

      if (res && res.success) {
        setImage(res.imageUrl);
        Alert.alert("Thành công", "Tải ảnh lên thành công!");
      } else {
        Alert.alert("Lỗi", "Không thể tải ảnh lên server.");
      }
    } catch (error) {
      console.log("Lỗi tải ảnh:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải ảnh lên.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert(
        "Thiếu thông tin",
        "Sếp ơi điền ít nhất Tên món và Giá tiền nhé!",
      );
      return;
    }

    const matchedCategory = categories.find(
      (cat) => cat.name.toLowerCase() === categorySearchText.trim().toLowerCase()
    );
    let selectedCategoryId = categoryId;
    if (matchedCategory) {
      selectedCategoryId = matchedCategory.id.toString();
    } else {
      Alert.alert(
        "Danh mục không hợp lệ",
        "Vui lòng chọn một danh mục từ danh sách gợi ý!"
      );
      return;
    }

    setLoading(true);
    const payload = {
      name,
      price: Number(price),
      image: image || "", // Lưu rỗng nếu không điền ảnh, phía hiển thị sẽ tự dùng ảnh mặc định mới
      description: desc,
      category_id: Number(selectedCategoryId),
      available: 1, // Mặc định mở bán
    };

    try {
      if (editProduct) {
        // CẬP NHẬT MÓN CŨ
        await useCallAPI({
          method: "PUT",
          url: `${URL_API}/store/${storeId}/products/${editProduct.id}`,
          token: tokenData,
          data: payload,
        });
        Alert.alert("Thành công", "Đã cập nhật món ăn!");
      } else {
        // THÊM MÓN MỚI
        await useCallAPI({
          method: "POST",
          url: `${URL_API}/store/${storeId}/products`,
          token: tokenData,
          data: payload,
        });
        Alert.alert("Thành công", "Đã thêm món ăn mới vào Menu!");
      }
      // Reset danh sách món để trang chủ tự động tải lại thực đơn mới nhất
      dispatch(resetProductTypeAll());
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
            Danh mục món ăn <Text style={{ color: "red" }}>*</Text>
          </Text>
          <View style={{ zIndex: 999, position: "relative", marginBottom: 16 }}>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={categorySearchText}
              onChangeText={(text) => {
                setCategorySearchText(text);
                setShowSuggestions(true);
              }}
              placeholder="Nhập tên danh mục (VD: cơm, phở...)"
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && categorySearchText.trim() !== "" && (
              <View style={styles.suggestionsContainer}>
                {categories.filter((cat) =>
                  cat.name.toLowerCase().includes(categorySearchText.toLowerCase())
                ).length > 0 ? (
                  categories
                    .filter((cat) =>
                      cat.name.toLowerCase().includes(categorySearchText.toLowerCase())
                    )
                    .map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setCategoryId(cat.id.toString());
                          setCategorySearchText(cat.name);
                          setShowSuggestions(false);
                        }}
                      >
                        <Feather name="tag" size={14} color="#6B7280" style={{ marginRight: 8 }} />
                        <Text style={styles.suggestionText}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))
                ) : (
                  <View style={styles.noSuggestionItem}>
                    <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                      Không tìm thấy danh mục tương tự
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Text style={styles.label}>Hình ảnh món ăn</Text>
          <View style={styles.imagePickerWrapper}>
            {image ? (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: image }} style={styles.previewImg} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setImage("")}
                >
                  <Feather name="x" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleSelectImage}
              >
                <Feather name="camera" size={24} color="#6B7280" style={{ marginBottom: 4 }} />
                <Text style={styles.uploadBtnText}>Tải ảnh lên từ thiết bị</Text>
              </TouchableOpacity>
            )}
          </View>

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
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  categoryPill: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPillActive: {
    backgroundColor: colors.blue_primary,
    borderColor: colors.blue_primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  categoryPillTextActive: {
    color: "#fff",
  },
  imagePickerWrapper: {
    marginBottom: 16,
  },
  previewWrapper: {
    position: "relative",
    width: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9CA3AF",
    borderRadius: 10,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionText: {
    fontSize: 14,
    color: "#1F2937",
  },
  noSuggestionItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
});

export default StoreProductForm;
