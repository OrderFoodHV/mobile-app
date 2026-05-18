import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { Container } from "@app-layout/Layout";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@redux/store";
import colors from "@assets/colors/global_colors";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";

const ProfileDetail = () => {
  // Lấy dữ liệu chuẩn từ auth slice giống file Personal.tsx
  const { account, tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(account?.user_name || "User HUCE");
  const [phone, setPhone] = useState(account?.phone || "0912.345.678");

  const handleSaveProfile = async () => {
    if (userName.trim() === "") {
      Alert.alert("Lỗi", "Tên tài khoản không được để trống nhen sếp!");
      return;
    }
    try {
      await useCallAPI({
        method: "PUT",
        url: `${URL_API}/users/update-profile`,
        token: tokenData,
        data: { user_name: userName, phone: phone },
        showToast: true,
        successTitle: "Cập nhật hồ sơ thành công!",
      });
      setIsEditing(false);
    } catch (error) {
      console.log("Lỗi cập nhật hồ sơ:", error);
    }
  };

  return (
    <Container style={{ backgroundColor: "#f5f6fa" }}>
      <HeaderCustom title="Thông tin tài khoản" isShowLeftButton={true} />

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Hồ sơ cá nhân</Text>

          {/* HÀNG SỬA TÊN */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên tài khoản</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
              />
            ) : (
              <Text style={styles.value}>{userName}</Text>
            )}
          </View>

          {/* HÀNG EMAIL (CỐ ĐỊNH) */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email liên hệ (Cố định)</Text>
            <Text style={[styles.value, { color: "#999" }]}>
              {account?.email || "huce_student@gmail.com"}
            </Text>
          </View>

          {/* HÀNG SỬA SỐ ĐIỆN THOẠI */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{phone}</Text>
            )}
          </View>

          {/* HÀNG VAI TRÒ */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vai trò hệ thống</Text>
            <Text
              style={[
                styles.value,
                { color: colors.blue_primary, fontWeight: "700" },
              ]}
            >
              {account?.role === "admin"
                ? "Chủ cửa hàng (Shop)"
                : account?.role === "shipper"
                  ? "Người giao hàng (Shipper)"
                  : "Khách hàng (Customer)"}
            </Text>
          </View>

          {/* CỤM NÚT ĐIỀU KHIỂN NẰM RÕ RÀNG TRONG CARD */}
          <View style={{ marginTop: 20 }}>
            {isEditing ? (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#F3F4F6" }]}
                  onPress={() => {
                    setIsEditing(false);
                    setUserName(account?.user_name || "");
                    setPhone(account?.phone || "");
                  }}
                >
                  <Text style={{ color: "#4B5563", fontWeight: "600" }}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.blue_primary }]}
                  onPress={handleSaveProfile}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Lưu lại
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.btn,
                  { borderWidth: 1, borderColor: colors.blue_primary },
                ]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={{ color: colors.blue_primary, fontWeight: "600" }}>
                  Chỉnh sửa thông tin
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: { fontSize: 13, color: "#777", marginBottom: 4 },
  value: { fontSize: 15, color: "#333", fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#F9FAFB",
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProfileDetail;
