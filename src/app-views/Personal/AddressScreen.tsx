import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "@assets/colors/global_colors";
import { useSelector } from "react-redux";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import axios from "axios";
import localAddressData from "../../assets/vietnam_provinces_local.json";
import MapPickerModal from "../../app-components/MapPickerModal";

interface AdminUnit {
  code: number;
  name: string;
}

const AddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const token = useSelector((state: any) => state.auth.tokenData);

  const [addressList, setAddressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // States for edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("Địa chỉ");
  const [editProvince, setEditProvince] = useState<AdminUnit | null>(null);
  const [editDistrict, setEditDistrict] = useState<AdminUnit | null>(null);
  const [editWard, setEditWard] = useState<AdminUnit | null>(null);
  const [editStreetDetail, setEditStreetDetail] = useState("");
  const [editLatitude, setEditLatitude] = useState<number | null>(null);
  const [editLongitude, setEditLongitude] = useState<number | null>(null);

  // States for add mode
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("Địa chỉ");
  const [newProvince, setNewProvince] = useState<AdminUnit | null>(null);
  const [newDistrict, setNewDistrict] = useState<AdminUnit | null>(null);
  const [newWard, setNewWard] = useState<AdminUnit | null>(null);
  const [newStreetDetail, setNewStreetDetail] = useState("");
  const [newLatitude, setNewLatitude] = useState<number | null>(null);
  const [newLongitude, setNewLongitude] = useState<number | null>(null);

  // States for map modal
  const [mapVisible, setMapVisible] = useState(false);
  const [mapTarget, setMapTarget] = useState<"add" | "edit">("add");

  // Dynamic dropdown list data
  const [provinces, setProvinces] = useState<AdminUnit[]>([]);
  const [districts, setDistricts] = useState<AdminUnit[]>([]);
  const [wards, setWards] = useState<AdminUnit[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  // Custom Modal Dropdown states
  const [dropdownModalVisible, setDropdownModalVisible] = useState(false);
  const [dropdownType, setDropdownType] = useState<"province" | "district" | "ward" | null>(null);
  const [dropdownTarget, setDropdownTarget] = useState<"add" | "edit">("add");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAddresses = async () => {
    if (!token) return;
    setLoading(true);
    const res = await useCallAPI({
      method: "GET",
      url: `${URL_API}/users/addresses`,
      token: token,
      showToast: false,
    });
    setLoading(false);
    if (res && res.success !== false) {
      setAddressList(res);
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await useCallAPI({
      method: "PUT",
      url: `${URL_API}/users/addresses/${id}/default`,
      token: token,
      showToast: true,
      successTitle: "Đặt địa chỉ mặc định thành công!",
    });
    if (res && res.success !== false) {
      loadAddresses();
    }
  };

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
    loadAddresses();
    fetchProvinces();
  }, [token]);

  // Open dropdown modal handler
  const openDropdown = async (type: "province" | "district" | "ward", target: "add" | "edit") => {
    setDropdownType(type);
    setDropdownTarget(target);
    setSearchQuery("");

    const activeProvince = target === "add" ? newProvince : editProvince;
    const activeDistrict = target === "add" ? newDistrict : editDistrict;

    if (type === "district" && !activeProvince) {
      Alert.alert("Thông báo", "Vui lòng chọn Tỉnh/Thành phố trước!");
      return;
    }

    if (type === "ward" && !activeDistrict) {
      Alert.alert("Thông báo", "Vui lòng chọn Quận/Huyện trước!");
      return;
    }

    // Show modal immediately to provide instant response and show dynamic loading spinner
    setDropdownModalVisible(true);

    if (type === "province") {
      await fetchProvinces();
    } else if (type === "district" && activeProvince) {
      await fetchDistricts(activeProvince.code);
    } else if (type === "ward" && activeDistrict) {
      await fetchWards(activeDistrict.code);
    }
  };

  // Selection item handler
  const handleSelectItem = (item: AdminUnit) => {
    if (dropdownTarget === "add") {
      if (dropdownType === "province") {
        setNewProvince(item);
        setNewDistrict(null);
        setNewWard(null);
        setDistricts([]);
        setWards([]);
      } else if (dropdownType === "district") {
        setNewDistrict(item);
        setNewWard(null);
        setWards([]);
      } else if (dropdownType === "ward") {
        setNewWard(item);
      }
    } else {
      if (dropdownType === "province") {
        setEditProvince(item);
        setEditDistrict(null);
        setEditWard(null);
        setDistricts([]);
        setWards([]);
      } else if (dropdownType === "district") {
        setEditDistrict(item);
        setEditWard(null);
        setWards([]);
      } else if (dropdownType === "ward") {
        setEditWard(item);
      }
    }
    setDropdownModalVisible(false);
  };

  // Map position selection handler
  const handleSelectLocation = (data: { latitude: number; longitude: number; address: string; rawAddress?: any }) => {
    const isAdd = mapTarget === "add";
    
    if (isAdd) {
      setNewLatitude(data.latitude);
      setNewLongitude(data.longitude);
    } else {
      setEditLatitude(data.latitude);
      setEditLongitude(data.longitude);
    }
    
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
        if (isAdd) {
          setNewProvince(selectedProv);
          setNewDistrict(null);
          setNewWard(null);
        } else {
          setEditProvince(selectedProv);
          setEditDistrict(null);
          setEditWard(null);
        }

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
          if (isAdd) {
            setNewDistrict(selectedDist);
            setNewWard(null);
          } else {
            setEditDistrict(selectedDist);
            setEditWard(null);
          }

          // 3. Tìm Phường/Xã trong Quận đã tìm được
          const osmWardName = raw.suburb || raw.subdistrict || raw.village || raw.ward || "";
          let foundW: any = null;
          if (osmWardName && foundDist.Wards) {
            foundW = foundDist.Wards.find((w: any) => 
              w.Name.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/g, "").trim() === osmWardName.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/g, "").trim()
            );
          }

          if (foundW) {
            const selectedWard = { code: Number(foundW.Id), name: foundW.Name };
            if (isAdd) {
              setNewWard(selectedWard);
            } else {
              setEditWard(selectedWard);
            }
          }
        }
      }

      // Gợi ý tên đường/số nhà
      const road = raw.road || raw.suburb || "";
      const houseNumber = raw.house_number || "";
      const suggestedStreet = houseNumber ? `${houseNumber} ${road}`.trim() : road.trim();
      if (suggestedStreet) {
        if (isAdd) setNewStreetDetail(suggestedStreet);
        else setEditStreetDetail(suggestedStreet);
      } else if (data.address) {
        const parts = data.address.split(",");
        if (parts.length > 0) {
          if (isAdd) setNewStreetDetail(parts[0].trim());
          else setEditStreetDetail(parts[0].trim());
        }
      }
    }

    Alert.alert(
      "Ghim bản đồ thành công 🎉",
      `Tọa độ đã chọn:\n${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}\n\nHệ thống đã tự động điền các thông tin địa chỉ tương thích.`
    );
  };

  // Helper to parse existing flat string address to structure if possible (fallback to detail)
  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditTitle(item.title || "Địa chỉ");
    setEditLatitude(item.latitude || null);
    setEditLongitude(item.longitude || null);
    
    // Parse address: "Số nhà..., Phường..., Quận..., Tỉnh..."
    const parts = (item.detail || "").split(",").map((p: string) => p.trim());
    if (parts.length >= 4) {
      const provinceName = parts[parts.length - 1];
      const districtName = parts[parts.length - 2];
      const wardName = parts[parts.length - 3];
      const street = parts.slice(0, parts.length - 3).join(", ");
      
      setEditProvince({ code: 0, name: provinceName });
      setEditDistrict({ code: 0, name: districtName });
      setEditWard({ code: 0, name: wardName });
      setEditStreetDetail(street);
    } else {
      setEditProvince(null);
      setEditDistrict(null);
      setEditWard(null);
      setEditStreetDetail(item.detail);
    }
  };

  // Save changes when editing
  const handleSaveEdit = async (id: string) => {
    if (!editProvince || !editDistrict || !editWard || !editStreetDetail.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin hành chính và số nhà!");
      return;
    }

    const fullAddress = `${editStreetDetail.trim()}, ${editWard.name}, ${editDistrict.name}, ${editProvince.name}`;

    const res = await useCallAPI({
      method: "PUT",
      url: `${URL_API}/users/addresses/${id}`,
      token: token,
      data: { 
        title: editTitle,
        address: fullAddress,
        latitude: editLatitude,
        longitude: editLongitude
      },
      showToast: true,
      successTitle: "Cập nhật địa chỉ thành công!",
    });
    if (res && res.success !== false) {
      loadAddresses();
      setEditingId(null);
    }
  };

  // Save new address
  const handleSaveNew = async () => {
    if (!newProvince || !newDistrict || !newWard || !newStreetDetail.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn đầy đủ Tỉnh/Huyện/Xã và nhập số nhà!");
      return;
    }

    const fullAddress = `${newStreetDetail.trim()}, ${newWard.name}, ${newDistrict.name}, ${newProvince.name}`;

    const res = await useCallAPI({
      method: "POST",
      url: `${URL_API}/users/addresses`,
      token: token,
      data: { 
        title: newTitle,
        address: fullAddress,
        latitude: newLatitude,
        longitude: newLongitude
      },
      showToast: true,
      successTitle: "Thêm địa chỉ thành công!",
    });
    if (res && res.success !== false) {
      loadAddresses();
      setIsAdding(false);
      setNewProvince(null);
      setNewDistrict(null);
      setNewWard(null);
      setNewStreetDetail("");
      setNewLatitude(null);
      setNewLongitude(null);
    }
  };

  // Filter items in dropdown based on search query
  const getFilteredItems = () => {
    let list: AdminUnit[] = [];
    if (dropdownType === "province") list = provinces;
    else if (dropdownType === "district") list = districts;
    else if (dropdownType === "ward") list = wards;

    return list.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* DUYỆT DANH SÁCH ĐỊA CHỈ */}
        {addressList.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.headerCard}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                <Feather name="map-pin" size={20} color={colors.blue_primary} />
                <Text style={styles.title}>{item.title}</Text>
                {Number(item.is_default) === 1 && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                  </View>
                )}
              </View>
              {/* Nút bấm để sửa địa chỉ */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {Number(item.is_default) !== 1 && (
                  <TouchableOpacity onPress={() => handleSetDefault(item.id)}>
                    <Text style={styles.setDefaultText}>Mặc định</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => startEditing(item)}>
                  <Feather name="edit" size={20} color={colors.blue_primary} />
                </TouchableOpacity>
              </View>
            </View>

            {editingId === item.id ? (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên nhãn địa chỉ (VD: Nhà riêng, Công ty)</Text>
                <TextInput
                  style={[styles.input, { minHeight: 40, marginBottom: 12 }]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />

                {/* EDIT MAP PINNING */}
                <Text style={styles.label}>Ghim vị trí trên Bản đồ (GPS)</Text>
                <TouchableOpacity
                  style={[
                    styles.dropdownSelector,
                    (editLatitude && editLongitude) ? { borderColor: "#10B981", borderWidth: 1.5 } : null
                  ]}
                  onPress={() => {
                    setMapTarget("edit");
                    setMapVisible(true);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownSelectorText,
                      !(editLatitude && editLongitude) && styles.placeholderText,
                      (editLatitude && editLongitude) && { color: "#10B981", fontWeight: "600" }
                    ]}
                  >
                    {(editLatitude && editLongitude) 
                      ? `Đã ghim: ${editLatitude.toFixed(5)}, ${editLongitude.toFixed(5)}` 
                      : "Bấm để chọn vị trí trên bản đồ..."}
                  </Text>
                  <Feather name="map" size={18} color={(editLatitude && editLongitude) ? "#10B981" : "#9CA3AF"} />
                </TouchableOpacity>

                <Text style={styles.label}>Tỉnh / Thành phố:</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  onPress={() => openDropdown("province", "edit")}
                >
                  <Text style={[styles.dropdownSelectorText, !editProvince && styles.placeholderText]}>
                    {editProvince ? editProvince.name : "Bấm chọn Tỉnh / Thành phố..."}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <Text style={styles.label}>Quận / Huyện:</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  onPress={() => openDropdown("district", "edit")}
                >
                  <Text style={[styles.dropdownSelectorText, !editDistrict && styles.placeholderText]}>
                    {editDistrict ? editDistrict.name : "Bấm chọn Quận / Huyện..."}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <Text style={styles.label}>Phường / Xã:</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  onPress={() => openDropdown("ward", "edit")}
                >
                  <Text style={[styles.dropdownSelectorText, !editWard && styles.placeholderText]}>
                    {editWard ? editWard.name : "Bấm chọn Phường / Xã..."}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <Text style={styles.label}>Số nhà, tên đường:</Text>
                <TextInput
                  style={[styles.input, { minHeight: 45, marginBottom: 15 }]}
                  value={editStreetDetail}
                  onChangeText={setEditStreetDetail}
                  placeholder="Gõ số nhà, ngách, tên đường cụ thể..."
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
              style={[styles.input, { minHeight: 40, marginBottom: 12 }]}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* ADD MAP PINNING */}
            <Text style={styles.label}>Ghim vị trí trên Bản đồ (GPS)</Text>
            <TouchableOpacity
              style={[
                styles.dropdownSelector,
                (newLatitude && newLongitude) ? { borderColor: "#10B981", borderWidth: 1.5 } : null
              ]}
              onPress={() => {
                setMapTarget("add");
                setMapVisible(true);
              }}
            >
              <Text
                style={[
                  styles.dropdownSelectorText,
                  !(newLatitude && newLongitude) && styles.placeholderText,
                  (newLatitude && newLongitude) && { color: "#10B981", fontWeight: "600" }
                ]}
              >
                {(newLatitude && newLongitude) 
                  ? `Đã ghim: ${newLatitude.toFixed(5)}, ${newLongitude.toFixed(5)}` 
                  : "Bấm để chọn vị trí trên bản đồ..."}
              </Text>
              <Feather name="map" size={18} color={(newLatitude && newLongitude) ? "#10B981" : "#9CA3AF"} />
            </TouchableOpacity>

            <Text style={styles.label}>Tỉnh / Thành phố:</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => openDropdown("province", "add")}
            >
              <Text style={[styles.dropdownSelectorText, !newProvince && styles.placeholderText]}>
                {newProvince ? newProvince.name : "Bấm chọn Tỉnh / Thành phố..."}
              </Text>
              <Feather name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={styles.label}>Quận / Huyện:</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => openDropdown("district", "add")}
            >
              <Text style={[styles.dropdownSelectorText, !newDistrict && styles.placeholderText]}>
                {newDistrict ? newDistrict.name : "Bấm chọn Quận / Huyện..."}
              </Text>
              <Feather name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={styles.label}>Phường / Xã:</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => openDropdown("ward", "add")}
            >
              <Text style={[styles.dropdownSelectorText, !newWard && styles.placeholderText]}>
                {newWard ? newWard.name : "Bấm chọn Phường / Xã..."}
              </Text>
              <Feather name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={styles.label}>Số nhà, tên đường:</Text>
            <TextInput
              style={[styles.input, { minHeight: 45, marginBottom: 15 }]}
              value={newStreetDetail}
              onChangeText={setNewStreetDetail}
              placeholder="Gõ số nhà, ngách, tên đường cụ thể..."
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
      </KeyboardAvoidingView>

      {/* 🌟 LEAFLET MAP MODAL */}
      <MapPickerModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onSelectLocation={handleSelectLocation}
        initialLatitude={mapTarget === "add" ? newLatitude : editLatitude}
        initialLongitude={mapTarget === "add" ? newLongitude : editLongitude}
      />

      {/* 🌟 CUSTOM MODAL DROPDOWN SELECTOR */}
      <Modal
        visible={dropdownModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDropdownModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {dropdownType === "province"
                  ? "Chọn Tỉnh / Thành phố"
                  : dropdownType === "district"
                  ? "Chọn Quận / Huyện"
                  : "Chọn Phường / Xã"}
              </Text>
              <TouchableOpacity onPress={() => setDropdownModalVisible(false)}>
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT BAR */}
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
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color={colors.blue_primary} />
                <Text style={styles.spinnerText}>Đang tải dữ liệu hành chính...</Text>
              </View>
            ) : (
              <FlatList
                data={getFilteredItems()}
                keyExtractor={(item) => item.code.toString()}
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
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp</Text>
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
    backgroundColor: colors.blue_primary || "#0284C7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
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
  label: { fontSize: 14, color: "#4B5563", marginBottom: 6, fontWeight: "600" },
  addressText: { fontSize: 15, color: "#4B5563", lineHeight: 22 },
  inputContainer: { marginTop: 10 },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    minHeight: 48,
    marginBottom: 12,
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    height: 52,
  },
  dropdownSelectorText: {
    fontSize: 15,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.blue_primary,
    paddingVertical: 14,
    borderRadius: 12,
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
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 15,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
  },
  defaultBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "bold",
  },
  setDefaultText: {
    color: colors.blue_primary,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },
});

export default AddressScreen;
