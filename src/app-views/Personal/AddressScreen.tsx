import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import { useAppTheme } from "src/app-context/ThemeContext"; // 👉 Import để ăn theo Dark Mode toàn cục

const AddressScreen = () => {
  const { themeColors } = useAppTheme();

  // Mảng quản lý danh sách địa chỉ động
  const [addresses, setAddresses] = useState<string[]>([
    "1/2 Đại La, Phường Đồng Tâm, Quận Hai Bà Trưng, Hà Nội",
  ]);
  const [inputText, setInputText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Hàm xử lý chung cho cả Thêm và Sửa
  const handleSave = () => {
    if (inputText.trim() === "") {
      Alert.alert("Lỗi", "Sếp vui lòng nhập địa chỉ nhé!");
      return;
    }

    if (editIndex !== null) {
      // 🛠️ HÀNH ĐỘNG SỬA ĐỊA CHỈ
      const updated = [...addresses];
      updated[editIndex] = inputText.trim();
      setAddresses(updated);
      Alert.alert("Thành công", "Đã cập nhật địa chỉ thành công!");
    } else {
      // ➕ HÀNH ĐỘNG THÊM ĐỊA CHỈ MỚI
      setAddresses([...addresses, inputText.trim()]);
      Alert.alert("Thành công", "Đã thêm địa chỉ mới!");
    }

    // Reset Form
    setInputText("");
    setIsFormOpen(false);
    setEditIndex(null);
  };

  // Khi bấm nút Sửa: Đổ chữ cũ vào ô nhập và bật form lên
  const handleEdit = (index: number) => {
    setEditIndex(index);
    setInputText(addresses[index]);
    setIsFormOpen(true);
  };

  // Hàm xóa địa chỉ phụ
  const handleDelete = (index: number) => {
    if (index === 0) {
      Alert.alert("Thông báo", "Không được xóa địa chỉ mặc định sếp ơi!");
      return;
    }
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
  };

  return (
    <Container style={{ backgroundColor: themeColors.bg }}>
      <HeaderCustom title="Sổ địa chỉ giao hàng" isShowLeftButton={true} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: themeColors.bg === "#121212" ? "#aaa" : "#666" },
          ]}
        >
          Danh sách địa chỉ
        </Text>

        {/* Vòng lặp danh sách địa chỉ */}
        {addresses.map((item, index) => (
          <View
            key={index}
            style={[
              styles.addressCard,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            <View style={styles.headerRow}>
              <Text style={styles.nameText}>Địa chỉ #{index + 1}</Text>
              {index === 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Mặc định</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText}>{item}</Text>

            {/* Thanh nút bấm hành động */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleEdit(index)}>
                <Text style={styles.editText}>Sửa địa chỉ</Text>
              </TouchableOpacity>
              {index > 0 && (
                <TouchableOpacity onPress={() => handleDelete(index)}>
                  <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Khối Nhập liệu thông minh (Dùng chung cho cả Thêm và Sửa) */}
        {isFormOpen ? (
          <View
            style={[styles.inputCard, { backgroundColor: themeColors.card }]}
          >
            <Text style={styles.formTitle}>
              {editIndex !== null ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ tại đây..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={(text) => setInputText(text)} // ✅ Hết sạch lỗi mất bàn phím!
              multiline
            />
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={[styles.miniBtn, styles.cancelBtn]}
                onPress={() => {
                  setIsFormOpen(false);
                  setInputText("");
                  setEditIndex(null);
                }}
              >
                <Text style={styles.miniBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.miniBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Text style={[styles.miniBtnText, { color: "#fff" }]}>
                  Lưu lại
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsFormOpen(true)}
          >
            <Text style={styles.addButtonText}>+ Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  addressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nameText: { fontSize: 14, fontWeight: "700", color: "#333" },
  badge: {
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { color: colors.blue_primary, fontSize: 11, fontWeight: "600" },
  addressText: { fontSize: 14, color: "#555", lineHeight: 20 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  editText: { color: colors.blue_primary, fontWeight: "600", fontSize: 13 },
  deleteText: { color: "#EF4444", fontWeight: "600", fontSize: 13 },
  addButton: {
    borderWidth: 1,
    borderColor: colors.blue_primary,
    borderStyle: "dashed",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: colors.blue_primary,
    fontWeight: "600",
    fontSize: 15,
  },
  inputCard: { borderRadius: 16, padding: 12, elevation: 2 },
  formTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#333",
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  miniBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: "#F3F4F6" },
  saveBtn: { backgroundColor: colors.blue_primary },
  miniBtnText: { 动作: "600", fontSize: 13, color: "#333" },
});

export default AddressScreen;
