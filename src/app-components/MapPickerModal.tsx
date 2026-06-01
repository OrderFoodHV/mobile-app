import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (data: {
    latitude: number;
    longitude: number;
    address: string;
    rawAddress?: any;
  }) => void;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialLatitude,
  initialLongitude,
}) => {
  const webViewRef = useRef<WebView>(null);
  // Khởi tạo ngay tọa độ mặc định để bản đồ render tức thời (không bị chờ GPS phần cứng)
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: initialLatitude || 21.0285,
    longitude: initialLongitude || 105.8542,
  });
  const [address, setAddress] = useState<string>("");
  const [rawAddress, setRawAddress] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hàm phụ để đẩy tin nhắn qua WebView dịch chuyển vị trí marker
  const panMapTo = (lat: number, lng: number) => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "PAN_TO",
        latitude: lat,
        longitude: lng,
      })
    );
  };

  // Hàm debounce gọi giải mã địa chỉ
  const debouncedReverseGeocode = (lat: number, lng: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setAddressLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      await reverseGeocode(lat, lng);
      setAddressLoading(false);
    }, 600);
  };

  // Lấy vị trí GPS thật chạy bất đồng bộ nền
  useEffect(() => {
    if (!visible) return;

    const resolveInitialLocation = async () => {
      // 1. Nếu có tọa độ truyền vào (sửa địa chỉ) -> sử dụng luôn
      if (initialLatitude && initialLongitude) {
        const initialCoords = { latitude: initialLatitude, longitude: initialLongitude };
        setCoords(initialCoords);
        setTimeout(() => panMapTo(initialLatitude, initialLongitude), 500);
        debouncedReverseGeocode(initialLatitude, initialLongitude);
        return;
      }

      // 2. Nếu lấy GPS thiết bị mới -> Chạy ngầm để không khóa màn hình
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          // A. Lấy tọa độ gần nhất (Last Known) - siêu nhanh (0.01s)
          const lastLoc = await Location.getLastKnownPositionAsync();
          if (lastLoc) {
            const lastCoords = {
              latitude: lastLoc.coords.latitude,
              longitude: lastLoc.coords.longitude,
            };
            setCoords(lastCoords);
            panMapTo(lastCoords.latitude, lastCoords.longitude);
            debouncedReverseGeocode(lastCoords.latitude, lastCoords.longitude);
          }

          // B. Lấy tọa độ GPS tươi mới tiếp theo (Balanced accuracy)
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const gpsCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCoords(gpsCoords);
          panMapTo(gpsCoords.latitude, gpsCoords.longitude);
          debouncedReverseGeocode(gpsCoords.latitude, gpsCoords.longitude);
        } else {
          // Hà Nội mặc định
          debouncedReverseGeocode(21.0285, 105.8542);
        }
      } catch (err) {
        console.log("Lỗi lấy GPS nền:", err);
        // Fallback geocode Hà Nội mặc định
        debouncedReverseGeocode(21.0285, 105.8542);
      }
    };

    resolveInitialLocation();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [visible, initialLatitude, initialLongitude]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "FoodApp/1.0 (contact@foodapp.com)",
          "Accept-Language": "vi",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
          setRawAddress(data.address || null);
        } else {
          setAddress(`Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          setRawAddress(null);
        }
      } else {
        setAddress(`Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setRawAddress(null);
      }
    } catch (error) {
      console.log("Lỗi giải mã tọa độ ngược:", error);
      setAddress(`Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setRawAddress(null);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "FoodApp/1.0 (contact@foodapp.com)",
          "Accept-Language": "vi",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoords({ latitude: lat, longitude: lon });
          setAddress(data[0].display_name);
          setRawAddress(data[0].address || null);
          
          // Dịch chuyển bản đồ trong WebView
          webViewRef.current?.postMessage(JSON.stringify({
            type: "PAN_TO",
            latitude: lat,
            longitude: lon,
          }));
        } else {
          Alert.alert("Thông báo", "Không tìm thấy địa chỉ này!");
        }
      }
    } catch (e) {
      console.log("Lỗi tìm kiếm địa chỉ:", e);
      Alert.alert("Lỗi", "Không thể tìm kiếm địa điểm lúc này!");
    } finally {
      setSearching(false);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "COORDS_CHANGED") {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        setCoords({ latitude: lat, longitude: lng });
        debouncedReverseGeocode(lat, lng);
      }
    } catch (e) {
      console.log("Lỗi nhận tin nhắn WebView:", e);
    }
  };

  const handleConfirm = () => {
    if (!coords) {
      Alert.alert("Lỗi", "Vui lòng chọn vị trí trên bản đồ!");
      return;
    }
    onSelectLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      address: address,
      rawAddress: rawAddress,
    });
    onClose();
  };

  const mapHtml = coords
    ? `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // 🌟 KHẮC PHỤC LỖI MARKER BỊ VỠ HÌNH TRÊN WEBVIEW
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    var map = L.map('map', { zoomControl: false }).setView([${coords.latitude}, ${coords.longitude}], 16);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var marker = L.marker([${coords.latitude}, ${coords.longitude}], { draggable: true }).addTo(map);

    function notifyCoords(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'COORDS_CHANGED',
        latitude: lat,
        longitude: lng
      }));
    }

    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      notifyCoords(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      notifyCoords(e.latlng.lat, e.latlng.lng);
    });

    // Lắng nghe lệnh dịch chuyển vị trí từ React Native
    window.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'PAN_TO') {
          var newLatLng = new L.LatLng(data.latitude, data.longitude);
          map.setView(newLatLng, 16);
          marker.setLatLng(newLatLng);
        }
      } catch (e) {
        console.log("Lỗi nhận tin nhắn panTo:", e);
      }
    });
  </script>
</body>
</html>
`
    : "";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="x" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ghim vị trí bản đồ</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>

        {/* 🌟 HỘP TÌM KIẾM ĐỊA CHỈ TRÊN BẢN ĐỒ */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập địa chỉ cần tìm (ví dụ: Huce, Đại La...)"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchAddress}
          />
          <TouchableOpacity onPress={handleSearchAddress} style={styles.searchBtn} disabled={searching}>
            {searching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Address Banner */}
        <View style={styles.addressBanner}>
          <Feather name="map-pin" size={18} color="#EF4444" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={styles.addressText} numberOfLines={2}>
            {loading ? "Đang tải vị trí..." : (addressLoading ? "Đang giải mã địa điểm..." : address || "Chọn một vị trí trên bản đồ...")}
          </Text>
        </View>

        {/* Map Body */}
        <View style={styles.mapContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#F97316" />
              <Text style={{ marginTop: 10, color: "#6B7280" }}>Đang khởi tạo bản đồ...</Text>
            </View>
          )}
          {coords && (
            <WebView
              ref={webViewRef}
              style={{ flex: 1 }}
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              onMessage={handleMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  confirmBtn: {
    backgroundColor: "#F97316",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  searchBox: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#1F2937",
    marginRight: 8,
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#F97316",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addressBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFEDD5",
  },
  addressText: { flex: 1, fontSize: 14, color: "#EA580C", fontWeight: "500", lineHeight: 20 },
  mapContainer: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});

export default MapPickerModal;
