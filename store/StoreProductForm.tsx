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
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSelector, shallowEqual, useDispatch } from "react-redux";

import HeaderApp from "../src/app-components/HeaderApp/HeaderApp";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [uploading, setUploading] = useState(false);

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
        // Nếu đang sửa món, gán tên danh mục tương ứng
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
    setUploading(true);
    try {
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1] || "jpeg";

      const formData = new FormData();
      formData.append("image", {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: `photo-${Date.now()}.${fileType}`,
        type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
      } as any);

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
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên món ăn bạn nhé!");
      return;
    }
    if (!price.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập giá bán món ăn!");
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
        "Vui lòng chọn hoặc tìm một danh mục hợp lệ từ danh sách!"
      );
      return;
    }

    setLoading(true);
    const payload = {
      name: name.trim(),
      price: Number(price),
      image: image || "",
      description: desc.trim(),
      category_id: Number(selectedCategoryId),
      available: 1,
    };

    try {
      if (editProduct) {
        await useCallAPI({
          method: "PUT",
          url: `${URL_API}/store/${storeId}/products/${editProduct.id}`,
          token: tokenData,
          data: payload,
        });
        Alert.alert("Thành công", "Đã cập nhật thông tin món ăn thành công!");
      } else {
        await useCallAPI({
          method: "POST",
          url: `${URL_API}/store/${storeId}/products`,
          token: tokenData,
          data: payload,
        });
        Alert.alert("Thành công", "Đã thêm món ăn mới vào Thực đơn!");
      }
      dispatch(resetProductTypeAll());
      navigation.goBack();
    } catch (error) {
      console.log("Lỗi lưu sản phẩm:", error);
      Alert.alert(
        "Lỗi",
        "Không thể lưu sản phẩm. Vui lòng đăng nhập lại hoặc thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }} edges={["top", "left", "right"]}>
      {/* Custom Premium Header Bar */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>
          {editProduct ? "Chỉnh sửa món ăn" : "Thêm món mới vào menu"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Banner/Header trang trí */}
        <View style={styles.formHeaderBanner}>
          <Text style={styles.bannerTitle}>
            {editProduct ? "Cập Nhật Món Ăn" : "Tạo Món Ăn Mới"}
          </Text>
          <Text style={styles.bannerSubtitle}>
            Điền đầy đủ thông tin để món ngon thu hút thực khách đặt hàng nhiều hơn
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Tên món */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tên món ăn <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Feather name="shopping-bag" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="VD: Cơm Chiên Dương Châu..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Giá món */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Giá bán lẻ (VNĐ) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Feather name="dollar-sign" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="VD: 45000"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.inputUnit}>đ</Text>
            </View>
          </View>

          {/* Danh mục */}
          <View style={[styles.inputGroup, { zIndex: 10 }]}>
            <Text style={styles.label}>
              Danh mục món <Text style={styles.required}>*</Text>
            </Text>
            
            {/* Quick badges gợi ý chọn nhanh */}
            <View style={styles.quickBadgesWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBadgesList}>
                {categories.slice(0, 6).map((cat) => {
                  const isSelected = categorySearchText.trim().toLowerCase() === cat.name.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.badge, isSelected && styles.badgeActive]}
                      onPress={() => {
                        setCategoryId(cat.id.toString());
                        setCategorySearchText(cat.name);
                        setShowSuggestions(false);
                      }}
                    >
                      <Text style={[styles.badgeText, isSelected && styles.badgeTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="tag" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={categorySearchText}
                onChangeText={(text) => {
                  setCategorySearchText(text);
                  setShowSuggestions(true);
                }}
                placeholder="Tìm hoặc chọn danh mục ở trên..."
                placeholderTextColor="#9CA3AF"
                onFocus={() => setShowSuggestions(true)}
              />
              {categorySearchText ? (
                <TouchableOpacity
                  onPress={() => {
                    setCategorySearchText("");
                    setCategoryId("");
                  }}
                  style={styles.clearInputBtn}
                >
                  <Feather name="x" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

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
                      Không tìm thấy danh mục tương ứng
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Hình ảnh */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hình ảnh sản phẩm</Text>
            <View style={styles.imagePickerWrapper}>
              {image ? (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: image }} style={styles.previewImg} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImage("")}
                    activeOpacity={0.8}
                  >
                    <Feather name="trash-2" size={16} color="#fff" />
                    <Text style={styles.removeText}>Xóa ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
                  onPress={handleSelectImage}
                  disabled={uploading}
                  activeOpacity={0.7}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#F97316" />
                  ) : (
                    <>
                      <View style={styles.uploadIconCircle}>
                        <Feather name="camera" size={24} color="#F97316" />
                      </View>
                      <Text style={styles.uploadBtnText}>Tải ảnh món ăn lên</Text>
                      <Text style={styles.uploadBtnSubtext}>Hỗ trợ định dạng JPG, PNG dưới 5MB</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Mô tả */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả chi tiết món ăn</Text>
            <View style={[styles.inputWrapper, { alignItems: "flex-start", paddingVertical: 12 }]}>
              <Feather name="align-left" size={20} color="#9CA3AF" style={[styles.inputIcon, { marginTop: 2 }]} />
              <TextInput
                style={[styles.input, { minHeight: 100, textAlignVertical: "top", paddingTop: 0 }]}
                value={desc}
                onChangeText={setDesc}
                multiline
                placeholder="Mô tả món ăn của bạn"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Nút lưu */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.8 }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Feather name="check" size={20} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.saveBtnText}>
              {loading ? "Đang lưu thông tin..." : editProduct ? "Cập Nhật Thay Đổi" : "Thêm Món Vào Menu"}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif-medium",
  },
  formHeaderBanner: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#FFEDD5",
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#EA580C",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  formContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
    position: "relative",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    paddingVertical: 8,
    height: "100%",
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    paddingLeft: 8,
  },
  clearInputBtn: {
    padding: 4,
  },
  quickBadgesWrapper: {
    marginBottom: 10,
  },
  quickBadgesList: {
    gap: 8,
    paddingVertical: 2,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  badgeActive: {
    backgroundColor: "#FFF7ED",
    borderColor: "#F97316",
  },
  badgeText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  badgeTextActive: {
    color: "#F97316",
    fontWeight: "700",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 86,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: 200,
    zIndex: 9999,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionText: {
    fontSize: 15,
    color: "#1F2937",
  },
  noSuggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  imagePickerWrapper: {
    marginTop: 4,
  },
  previewWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewImg: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 12,
  },
  removeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  uploadBtn: {
    height: 150,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadBtnDisabled: {
    opacity: 0.7,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EA580C",
    marginBottom: 4,
  },
  uploadBtnSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#F97316",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default StoreProductForm;

