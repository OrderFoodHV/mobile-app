import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import colors from "@assets/colors/global_colors";

interface RatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  orderId: string | number;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isVisible,
  onClose,
  orderId,
}) => {
  const [rating, setRating] = useState(5); // Mặc định chấm 5 sao yêu thương
  const [comment, setComment] = useState("");

  const handleSubmitReview = () => {
    if (comment.trim() === "") {
      Alert.alert("Thông báo", "bạn vui lòng gõ vài lời nhận xét món ăn nhé!");
      return;
    }

    // Đoạn này để bắn API POST lưu bình luận xuống bảng reviews dưới MySQL
    Alert.alert(
      "Thành công",
      `Cảm ơn bạn đã đánh giá ${rating} sao cho đơn hàng #${orderId}! Bình luận đã được gửi tới quán nhen.`,
      [
        {
          text: "OK",
          onPress: () => {
            setComment("");
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>🍳 Đánh giá món ăn</Text>
            <Text style={styles.subTitle}>
              Đơn hàng #{orderId} đã giao thành công, bạn ăn có ngon miệng không
              nè?
            </Text>

            {/* HÀNG NGÔI SAO BẤM CHỌN ĐỘNG */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <AntDesign
                    name={star <= rating ? "star" : "staro"}
                    size={32}
                    color={star <= rating ? "#FBBF24" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Ô NHẬP BÌNH LUẬN CRITIC */}
            <TextInput
              style={styles.input}
              placeholder="Món ăn giòn ngon, giao hàng siêu tốc bạn ơi..."
              placeholderTextColor="#999"
              value={comment}
              onChangeText={setComment}
              multiline
            />

            {/* KHỐI NÚT HÀNH ĐỘNG */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.btnText}>Để sau</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.submitBtn]}
                onPress={handleSubmitReview}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>
                  Gửi đánh giá
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  starsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#333",
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  btnRow: { flexDirection: "row", gap: 12, width: "100%" },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  cancelBtn: { backgroundColor: "#F3F4F6" },
  submitBtn: { backgroundColor: colors.blue_primary },
  btnText: { fontWeight: "600", fontSize: 14, color: "#4B5563" },
});
