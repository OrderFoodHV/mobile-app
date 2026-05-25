import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { updateAuthInfor } from "../../redux/features/authSlice";

const ShipperSettings: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.account);

  const [name, setName] = useState(user?.name || user?.user_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [vehicle, setVehicle] = useState(user?.vehicle || "");
  const [licensePlate, setLicensePlate] = useState(user?.license_plate || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar || null,
  );
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = () => {
    setLoading(true);

    setTimeout(() => {
      // 🌟 ÉP REDUX CẬP NHẬT TRỰC TIẾP TẤT CẢ CÁC TRƯỜNG
      dispatch(
        updateAuthInfor({
          name: name,
          user_name: name,
          phone: phone,
          vehicle: vehicle,
          license_plate: licensePlate,
          avatar: avatarUri, // Nhét cái link ảnh này vào Redux
        }),
      );

      setLoading(false);
      Alert.alert("Thành công", "Đã cập nhật hồ sơ tài xế!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }, 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ tài xế</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="camera" size={40} color="#F97316" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Feather name="edit-2" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Chạm để thay đổi ảnh</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Loại xe</Text>
          <TextInput
            style={styles.input}
            value={vehicle}
            onChangeText={setVehicle}
          />

          <Text style={styles.label}>Biển số xe</Text>
          <TextInput
            style={styles.input}
            value={licensePlate}
            onChangeText={setLicensePlate}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Lưu hồ sơ</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { paddingRight: 15 },
  headerTitle: { color: "#ffffff", fontSize: 20, fontWeight: "bold" },
  container: { padding: 16 },
  avatarSection: { alignItems: "center", marginVertical: 20 },
  avatarWrap: { position: "relative" },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#F97316",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF7ED",
    borderWidth: 3,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: { marginTop: 10, color: "#6B7280", fontSize: 14 },
  formCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 30,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#4B5563", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  saveBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
export default ShipperSettings;
