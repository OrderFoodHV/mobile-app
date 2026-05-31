// src/app-views/Personal/ProfileDetail.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import colors from "@assets/colors/global_colors";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { updateAuthInfor } from "@redux/features/authSlice";
import { Ionicons } from "@expo/vector-icons";

const ProfileDetail = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { account, tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(account?.user_name || "User HUCE");
  const [phone, setPhone] = useState((account as any)?.phone || "0912345678");

  useEffect(() => {
    if (account) {
      setUserName(account.user_name || "");
      setPhone((account as any).phone || "");
    }
  }, [account]);

  const handleSaveProfile = async () => {
    if (userName.trim() === "") {
      Alert.alert("Lỗi", "Tên tài khoản không được để trống nhen bạn!");
      return;
    }
    if (phone.trim() === "") {
      Alert.alert("Lỗi", "Số điện thoại không được để trống nhen bạn!");
      return;
    }

    try {
      await useCallAPI({
        method: "PATCH",
        url: `${URL_API}/users/update-me`,
        token: tokenData,
        data: { name: userName, phone: phone },
        showToast: true,
        successTitle: "Cập nhật hồ sơ thành công!",
      });

      dispatch(updateAuthInfor({ user_name: userName, phone: phone }));
      setIsEditing(false);
    } catch (error) {
      console.log("Lỗi cập nhật hồ sơ:", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }} edges={["top", "left", "right"]}>
      <HeaderCustom title="Thông tin tài khoản" isShowLeftButton={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* AVATAR HEADER BANNER */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{account?.email || "huce_student@gmail.com"}</Text>
          </View>

          {/* DETAIL CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>

            {/* FIELD: TÊN TÀI KHOẢN */}
            <View style={styles.fieldRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color={colors.blue_primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.label}>Tên tài khoản</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Nhập tên tài khoản..."
                  />
                ) : (
                  <Text style={styles.value}>{userName}</Text>
                )}
              </View>
            </View>

            {/* FIELD: EMAIL */}
            <View style={styles.fieldRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.label}>Email liên hệ (Cố định)</Text>
                <Text style={[styles.value, { color: "#9CA3AF" }]}>
                  {account?.email || "huce_student@gmail.com"}
                </Text>
              </View>
            </View>

            {/* FIELD: SỐ ĐIỆN THOẠI */}
            <View style={styles.fieldRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.blue_primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.label}>Số điện thoại</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="numeric"
                    placeholder="Nhập số điện thoại..."
                  />
                ) : (
                  <Text style={styles.value}>{phone || "Chưa cập nhật"}</Text>
                )}
              </View>
            </View>

            {/* FIELD: VAI TRÒ */}
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.label}>Vai trò hệ thống</Text>
                <Text style={[styles.value, { color: colors.blue_primary, fontWeight: "700" }]}>
                  {account?.role === "admin"
                    ? "Quản trị viên (Admin)"
                    : account?.role === "shipper"
                      ? "Người giao hàng (Shipper)"
                      : "Khách hàng (User)"}
                </Text>
              </View>
            </View>

          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.buttonWrapper}>
            {isEditing ? (
              <View style={styles.editingButtonsContainer}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={() => {
                    setIsEditing(false);
                    setUserName(account?.user_name || "");
                    setPhone((account as any)?.phone || "");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.saveBtn]}
                  onPress={handleSaveProfile}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveBtnText}>Lưu lại</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.editBtn]}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    borderWidth: 3,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.blue_primary,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  fieldContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    marginTop: 4,
  },
  buttonWrapper: {
    marginBottom: 40,
  },
  editingButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelBtnText: {
    color: "#4B5563",
    fontWeight: "700",
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: colors.blue_primary,
    shadowColor: colors.blue_primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  editBtn: {
    backgroundColor: colors.blue_primary,
    shadowColor: colors.blue_primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  editBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default ProfileDetail;
