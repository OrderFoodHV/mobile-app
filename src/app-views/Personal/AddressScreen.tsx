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
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import HeaderApp from "@app-components/HeaderApp/HeaderApp";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";

const AddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // 🌟 KHÔI PHỤC DANH SÁCH ĐỊA CHỈ ĐỂ DEMO CHUẨN
  const [addressList, setAddressList] = useState([
    {
      id: "1",
      title: "Nhà riêng",
      detail: "Số 55 Giải Phóng, Hai Bà Trưng, Hà Nội",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // State quản lý việc bật/tắt form Thêm địa chỉ mới
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("Văn phòng");
  const [newDetail, setNewDetail] = useState("");

  // Hàm lưu khi sửa địa chỉ cũ
  const handleSaveEdit = (id: string) => {
    setAddressList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, detail: editValue } : item,
      ),
    );
    setEditingId(null);
    Alert.alert("Thành công", "Đã cập nhật địa chỉ giao hàng!");
  };

  // 🌟 HÀM XỬ LÝ LƯU ĐỊA CHỈ MỚI
  const handleSaveNew = () => {
    if (!newDetail.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập chi tiết địa chỉ!");
      return;
    }
    const newAddress = {
      id: Date.now().toString(),
      title: newTitle,
      detail: newDetail,
    };
    setAddressList([...addressList, newAddress]);
    setIsAdding(false);
    setNewDetail("");
    Alert.alert("Thành công", "Đã thêm địa chỉ mới!");
  };

  return (
    <Container style={{ backgroundColor: "#F3F4F6" }}>
      <HeaderApp
        title="Địa chỉ giao hàng"
        leftIcon="arrow-left"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* DUYỆT DANH SÁCH ĐỊA CHỈ */}
        {addressList.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.headerCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="map-pin" size={20} color={colors.blue_primary} />
                <Text style={styles.title}>{item.title}</Text>
              </View>
              {/* Nút bấm để sửa địa chỉ */}
              <TouchableOpacity
                onPress={() => {
                  setEditingId(item.id);
                  setEditValue(item.detail);
                }}
              >
                <Feather name="edit" size={20} color={colors.blue_primary} />
              </TouchableOpacity>
            </View>

            {editingId === item.id ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                  multiline
                />
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      { backgroundColor: "#9CA3AF", marginRight: 10 },
                    ]}
                    onPress={() => setEditingId(null)}
                  >
                    <Text style={styles.saveBtnText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => handleSaveEdit(item.id)}
                  >
                    <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.addressText}>{item.detail}</Text>
            )}
          </View>
        ))}

        {/* 🌟 FORM THÊM ĐỊA CHỈ MỚI */}
        {isAdding ? (
          <View
            style={[
              styles.card,
              { borderColor: colors.blue_primary, borderWidth: 1 },
            ]}
          >
            <Text style={styles.label}>
              Tên địa chỉ (VD: Công ty, Nhà riêng)
            </Text>
            <TextInput
              style={[styles.input, { minHeight: 40, marginBottom: 10 }]}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.label}>Chi tiết địa chỉ:</Text>
            <TextInput
              style={styles.input}
              value={newDetail}
              onChangeText={setNewDetail}
              placeholder="Nhập địa chỉ cụ thể..."
              multiline
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: "#FEE2E2", marginRight: 10 },
                ]}
                onPress={() => setIsAdding(false)}
              >
                <Text style={[styles.saveBtnText, { color: "#EF4444" }]}>
                  Hủy bỏ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNew}>
                <Text style={styles.saveBtnText}>Xác nhận Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsAdding(true)}
          >
            <Feather
              name="plus-circle"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addBtnText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#1F2937", marginLeft: 8 },
  label: { fontSize: 14, color: "#6B7280", marginBottom: 6, fontWeight: "500" },
  addressText: { fontSize: 15, color: "#4B5563", lineHeight: 22 },
  inputContainer: { marginTop: 10 },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.blue_primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  addBtn: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default AddressScreen;
