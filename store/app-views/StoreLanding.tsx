import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { Feather, Ionicons } from "@expo/vector-icons";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { updateAuthInfor } from "src/redux/features/authSlice";
import colors from "@assets/colors/global_colors";
import axios from "axios";
import localAddressData from "../../src/assets/vietnam_provinces_local.json";
import MapPickerModal from "../../src/app-components/MapPickerModal";

interface AdminUnit {
  code: number;
  name: string;
}

const StoreLanding: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.tokenData);

  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetDetail, setStreetDetail] = useState("");
  const [loading, setLoading] = useState(false);

  // GPS coordinates states
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapVisible, setMapVisible] = useState(false);

  // Administrative units states
  const [province, setProvince] = useState<AdminUnit | null>(null);
  const [district, setDistrict] = useState<AdminUnit | null>(null);
  const [ward, setWard] = useState<AdminUnit | null>(null);

  // List options states
  const [provinces, setProvinces] = useState<AdminUnit[]>([]);
  const [districts, setDistricts] = useState<AdminUnit[]>([]);
  const [wards, setWards] = useState<AdminUnit[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  // Modal states
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownType, setDropdownType] = useState<"province" | "district" | "ward" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load provinces from local dataset instantly
  const fetchProvinces = async () => {
    try {
      const parsedProvinces = localAddressData.map((p: any) => ({
        code: Number(p.Id),
        name: p.Name
      }));
      setProvinces(parsedProvinces);
    } catch (error) {
      console.log("Error loading provinces:", error);
    }
  };

  // Load districts from local dataset instantly
  const fetchDistricts = async (provinceCode: number) => {
    try {
      const foundProvince = localAddressData.find((p: any) => Number(p.Id) === provinceCode);
      if (foundProvince && foundProvince.Districts) {
        const parsedDistricts = foundProvince.Districts.map((d: any) => ({
          code: Number(d.Id),
          name: d.Name
        }));
        setDistricts(parsedDistricts);
      }
    } catch (error) {
      console.log("Error loading districts:", error);
    }
  };

  // Load wards from local dataset instantly
  const fetchWards = async (districtCode: number) => {
    try {
      let foundDistrict: any = null;
      for (const p of localAddressData) {
        const d = p.Districts.find((dist: any) => Number(dist.Id) === districtCode);
        if (d) {
          foundDistrict = d;
          break;
        }
      }
      if (foundDistrict && foundDistrict.Wards) {
        const parsedWards = foundDistrict.Wards.map((w: any) => ({
          code: Number(w.Id),
          name: w.Name
        }));
        setWards(parsedWards);
      }
    } catch (error) {
      console.log("Error loading wards:", error);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const openDropdown = async (type: "province" | "district" | "ward") => {
    setDropdownType(type);
    setSearchQuery("");

    if (type === "district" && !province) {
      Alert.alert("Thông báo", "Vui lòng chọn Tỉnh/Thành phố trước!");
      return;
    }

    if (type === "ward" && !district) {
      Alert.alert("Thông báo", "Vui lòng chọn Quận/Huyện trước!");
      return;
    }

    // Show modal immediately
    setDropdownVisible(true);

    if (type === "province") {
      await fetchProvinces();
    } else if (type === "district" && province) {
      await fetchDistricts(province.code);
    } else if (type === "ward" && district) {
      await fetchWards(district.code);
    }
  };

  const handleSelectItem = (item: AdminUnit) => {
    if (dropdownType === "province") {
      setProvince(item);
      setDistrict(null);
      setWard(null);
      setDistricts([]);
      setWards([]);
    } else if (dropdownType === "district") {
      setDistrict(item);
      setWard(null);
      setWards([]);
    } else if (dropdownType === "ward") {
      setWard(item);
    }
    setDropdownVisible(false);
  };

  const handleSelectLocation = (data: { latitude: number; longitude: number; address: string; rawAddress?: any }) => {
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    
    // Tự động giải mã và điền Tỉnh/Huyện/Xã và tên đường từ rawAddress
    if (data.rawAddress) {
      const raw = data.rawAddress;
      
      // 1. Tìm Tỉnh/Thành phố
      const osmProvinceName = raw.state || raw.city || raw.province || "";
      let foundProv: any = null;
      if (osmProvinceName) {
        foundProv = localAddressData.find((p: any) => 
          p.Name.toLowerCase().replace(/^(tỉnh|thành phố)\s+/g, "").trim() === osmProvinceName.toLowerCase().replace(/^(tỉnh|thành phố)\s+/g, "").trim()
        );
      }

      if (foundProv) {
        const selectedProv = { code: Number(foundProv.Id), name: foundProv.Name };
        setProvince(selectedProv);

        // 2. Tìm Quận/Huyện trong Tỉnh đã tìm được
        const osmDistrictName = raw.district || raw.city_district || raw.county || raw.town || "";
        let foundDist: any = null;
        if (osmDistrictName && foundProv.Districts) {
          foundDist = foundProv.Districts.find((d: any) => 
            d.Name.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố)\s+/g, "").trim() === osmDistrictName.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố)\s+/g, "").trim()
          );
        }

        if (foundDist) {
          const selectedDist = { code: Number(foundDist.Id), name: foundDist.Name };
          setDistrict(selectedDist);

          // 3. Tìm Phường/Xã trong Quận đã tìm được
          const osmWardName = raw.suburb || raw.subdistrict || raw.village || raw.ward || "";
          let foundW: any = null;
          if (osmWardName && foundDist.Wards) {
            foundW = foundDist.Wards.find((w: any) => 
              w.Name.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/g, "").trim() === osmWardName.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/g, "").trim()
            );
          }

          if (foundW) {
            setWard({ code: Number(foundW.Id), name: foundW.Name });
          }
        }
      }

      // Gợi ý tên đường/số nhà
      const road = raw.road || raw.suburb || "";
      const houseNumber = raw.house_number || "";
      const suggestedStreet = houseNumber ? `${houseNumber} ${road}`.trim() : road.trim();
      if (suggestedStreet) {
        setStreetDetail(suggestedStreet);
      } else if (data.address) {
        const parts = data.address.split(",");
        if (parts.length > 0) {
          setStreetDetail(parts[0].trim());
        }
      }
    }

    Alert.alert(
      "Ghim bản đồ thành công 🎉",
      `Tọa độ đã chọn:\n${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}\n\nHệ thống đã tự động điền các thông tin địa chỉ tương thích.`
    );
  };

  const handleRegisterStore = async () => {
    if (!storeName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên cửa hàng!");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại liên hệ!");
      return;
    }
    if (!province || !district || !ward || !streetDetail.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn đầy đủ địa chỉ hành chính và số nhà/đường phố!");
      return;
    }

    const fullAddress = `${streetDetail.trim()}, ${ward.name}, ${district.name}, ${province.name}`;

    setLoading(true);
    const res = await useCallAPI({
      method: "POST",
      url: `${URL_API}/store/register`,
      token: token,
      data: { 
        store_name: storeName.trim(), 
        address: fullAddress, 
        phone: phone.trim(),
        latitude: latitude,
        longitude: longitude
      },
    });
    setLoading(false);

    if (res?.success) {
      dispatch(
        updateAuthInfor({
          storeStatus: "pending",
        })
      );
      Alert.alert(
        "Đăng ký thành công 🎉",
        res.message || "Yêu cầu đăng ký mở quán của bạn đã được gửi. Vui lòng chờ Admin phê duyệt!",
        [{ text: "Đồng ý", onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert("Đăng ký thất bại", res?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const getFilteredItems = () => {
    const list =
      dropdownType === "province"
        ? provinces
        : dropdownType === "district"
        ? districts
        : wards;

    if (!searchQuery.trim()) return list;

    return list.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký mở cửa hàng</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin đối tác</Text>

            <Text style={styles.label}>Tên cửa hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên quán (Ví dụ: Cơm gà Hải Nam)..."
              placeholderTextColor="#9CA3AF"
              value={storeName}
              onChangeText={setStoreName}
            />

            <Text style={styles.label}>Số điện thoại liên hệ</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại liên hệ của quán..."
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* GPS MAP PINNING BUTTON */}
            <Text style={styles.label}>Ghim vị trí trên Bản đồ (GPS)</Text>
            <TouchableOpacity
              style={[
                styles.dropdownSelector,
                (latitude && longitude) ? { borderColor: "#10B981", borderWidth: 1.5 } : null
              ]}
              onPress={() => setMapVisible(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !(latitude && longitude) && styles.placeholderText,
                  (latitude && longitude) && { color: "#10B981", fontWeight: "600" }
                ]}
              >
                {(latitude && longitude) 
                  ? `Đã ghim: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` 
                  : "Bấm để chọn vị trí trên bản đồ..."}
              </Text>
              <Feather name="map" size={18} color={(latitude && longitude) ? "#10B981" : "#9CA3AF"} />
            </TouchableOpacity>

            <Text style={styles.label}>Tỉnh / Thành phố</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => openDropdown("province")}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !province && styles.placeholderText,
                ]}
              >
                {province ? province.name : "Chọn Tỉnh / Thành phố..."}
              </Text>
              <Feather name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={styles.label}>Quận / Huyện</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => openDropdown("district")}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !district && styles.placeholderText,
                ]}
              >
                {district ? district.name : "Chọn Quận / Huyện..."}
              </Text>
              <Feather name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={styles.label}>Phường / Xã</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => openDropdown("ward")}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !ward && styles.placeholderText,
                ]}
              >
                {ward ? ward.name : "Chọn Phường / Xã..."}
              </Text>
              <Feather name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={styles.label}>Số nhà, ngõ ngách, tên đường</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Nhập số nhà, số ngõ, tên đường..."
              placeholderTextColor="#9CA3AF"
              value={streetDetail}
              onChangeText={setStreetDetail}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleRegisterStore}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Gửi yêu cầu đăng ký</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MAP MODAL */}
      <MapPickerModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onSelectLocation={handleSelectLocation}
        initialLatitude={latitude}
        initialLongitude={longitude}
      />
      <Modal visible={dropdownVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {dropdownType === "province"
                  ? "Chọn Tỉnh/Thành phố"
                  : dropdownType === "district"
                  ? "Chọn Quận/Huyện"
                  : "Chọn Phường/Xã"}
              </Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Feather name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm nhanh..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {fetchingOptions ? (
              <View style={styles.centerSpinner}>
                <ActivityIndicator size="large" color={colors.blue_primary} />
                <Text style={styles.spinnerText}>Đang tải dữ liệu...</Text>
              </View>
            ) : (
              <FlatList
                data={getFilteredItems()}
                keyExtractor={(item) => item.code.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectItem(item)}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    <Feather name="chevron-right" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.centerSpinner}>
                    <Text style={styles.spinnerText}>Không tìm thấy kết quả</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
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
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  submitBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: "#FCA5A5",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "75%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  centerSpinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  spinnerText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 15,
  },
});

export default StoreLanding;
