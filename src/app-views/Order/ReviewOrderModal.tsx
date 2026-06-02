import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useAppTheme } from "src/app-context/ThemeContext";

interface ReviewOrderModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: any;
  tokenData: any;
  onSuccess: () => void;
  existingReview?: any;
}

const StarRating = ({ rating, setRating, readonly = false }: any) => {
  return (
    <View style={{ flexDirection: "row", marginTop: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={readonly}
          onPress={() => setRating(star)}
          style={{ marginRight: 6 }}
        >
          <Feather
            name="star"
            size={28}
            color={star <= rating ? "#F59E0B" : "#D1D5DB"}
            style={star <= rating ? { fill: "#F59E0B" } : undefined}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewOrderModal: React.FC<ReviewOrderModalProps> = ({
  visible,
  onClose,
  orderId,
  tokenData,
  onSuccess,
  existingReview,
}) => {
  const { themeColors } = useAppTheme();
  const isReadonly = !!existingReview;

  const [storeRating, setStoreRating] = useState(existingReview?.store_rating || 5);
  const [storeComment, setStoreComment] = useState(existingReview?.store_comment || "");
  const [shipperRating, setShipperRating] = useState(existingReview?.shipper_rating || 5);
  const [shipperComment, setShipperComment] = useState(existingReview?.shipper_comment || "");
  const [imageUri, setImageUri] = useState<string | null>(existingReview?.image_url || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (isReadonly) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "review.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${URL_API}/upload`, {
        method: "POST",
        body: formData,
      });

      const resJson = await response.json();
      if (resJson.success && resJson.imageUrl) {
        return resJson.imageUrl;
      }
      return null;
    } catch (error) {
      console.log("Upload error:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!storeRating) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao cho cửa hàng!");
      return;
    }

    setLoading(true);
    let finalImageUrl = null;

    if (imageUri && !imageUri.startsWith("http")) {
      finalImageUrl = await uploadImage(imageUri);
    } else if (imageUri?.startsWith("http")) {
      finalImageUrl = imageUri;
    }

    try {
      const res = await useCallAPI({
        method: "POST",
        url: `${URL_API}/orders/${orderId}/reviews`,
        token: tokenData,
        data: {
          store_rating: storeRating,
          store_comment: storeComment,
          shipper_rating: shipperRating,
          shipper_comment: shipperComment,
          image_url: finalImageUrl,
        },
      });

      if (res?.status === "success") {
        Alert.alert("Thành công", "Cảm ơn bạn đã gửi đánh giá!");
        onSuccess();
        onClose();
      } else {
        Alert.alert("Lỗi", res?.message || "Không thể gửi đánh giá!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={[styles.modalContainer, { backgroundColor: themeColors.bg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              {isReadonly ? "Chi tiết đánh giá" : "Đánh giá đơn hàng"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            {/* Đánh giá Shop */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>1. Đánh giá Cửa hàng</Text>
              <StarRating rating={storeRating} setRating={setStoreRating} readonly={isReadonly} />
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
                placeholder="Nhận xét về chất lượng món ăn..."
                placeholderTextColor="#9CA3AF"
                multiline
                editable={!isReadonly}
                value={storeComment}
                onChangeText={setStoreComment}
              />
            </View>

            {/* Đánh giá Shipper */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>2. Đánh giá Shipper</Text>
              <StarRating rating={shipperRating} setRating={setShipperRating} readonly={isReadonly} />
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
                placeholder="Nhận xét về tài xế (thái độ, thời gian giao)..."
                placeholderTextColor="#9CA3AF"
                multiline
                editable={!isReadonly}
                value={shipperComment}
                onChangeText={setShipperComment}
              />
            </View>

            {/* Thêm ảnh đính kèm */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 8 }]}>3. Ảnh đính kèm</Text>
              {imageUri ? (
                <View style={{ position: "relative", width: 120, height: 120 }}>
                  <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, borderRadius: 8 }} />
                  {!isReadonly && (
                    <TouchableOpacity
                      style={styles.removeImgBtn}
                      onPress={() => setImageUri(null)}
                    >
                      <Feather name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                !isReadonly && (
                  <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                    <Feather name="camera" size={24} color="#6B7280" />
                    <Text style={{ color: "#6B7280", marginTop: 4 }}>Thêm ảnh</Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Nút gửi */}
            {!isReadonly && (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Gửi đánh giá</Text>}
              </TouchableOpacity>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "700" },
  closeBtn: { padding: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    height: 80,
    textAlignVertical: "top",
  },
  uploadBtn: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImgBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 4,
  },
  submitBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default ReviewOrderModal;
