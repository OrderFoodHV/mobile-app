import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "src/app-context/ThemeContext";
import { useNavigationServices } from "@app-helper/navigateToScreens";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { resetAllAuth } from "@redux/features/authSlice";
import { resetAllCart } from "@redux/features/cartSlice";
import { resetAllOrderData } from "@redux/features/orderSlice";
import { resetAllProductListData } from "@redux/features/productListSlice";
import ServiceStorage from "@app-services/service-storage";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { replaceScreen } = useNavigationServices();
  const { isDarkMode, toggleTheme, themeColors } = useAppTheme();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ CẢNH BÁO",
      "Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này không? Toàn bộ lịch sử đơn hàng và giỏ hàng của bạn sẽ mất và không thể khôi phục lại được!",
      [
        { text: "Hủy bỏ", style: "cancel" },
        {
          text: "Vẫn xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await useCallAPI({
                method: "DELETE",
                url: `${URL_API}/users/delete-account`,
                token: tokenData,
                showToast: true,
                successTitle: "Đã xóa tài khoản vĩnh viễn!",
              });

              await ServiceStorage.clearAll();
              dispatch(resetAllAuth());
              dispatch(resetAllCart());
              dispatch(resetAllOrderData());
              dispatch(resetAllProductListData());

              replaceScreen("Login");
            } catch (error) {
              console.log("Lỗi khi xóa tài khoản:", error);
              Alert.alert(
                "Lỗi hệ thống",
                "Không thể thực hiện xóa tài khoản lúc này, bạn kiểm tra lại Backend nhen!",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }} edges={["top", "left", "right"]}>
      <HeaderCustom title="Cài đặt hệ thống" isShowLeftButton={true} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* SECTION: TÙY CHỌN GIAO DIỆN */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Cá nhân hóa</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 }]}>
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.leftRow}>
              <View style={[styles.iconWrapper, { backgroundColor: "#E0F2FE" }]}>
                <Ionicons name="moon" size={20} color="#0284C7" />
              </View>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                Giao diện tối (Dark Mode)
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
              thumbColor={isDarkMode ? "#3B82F6" : "#F4F3F4"}
            />
          </View>

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.leftRow}>
              <View style={[styles.iconWrapper, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="notifications" size={20} color="#D97706" />
              </View>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                Thông báo đẩy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* SECTION: HỖ TRỢ */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Hỗ trợ & Pháp lý</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 }]}>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.7}>
            <View style={styles.leftRow}>
              <View style={[styles.iconWrapper, { backgroundColor: "#E0F2FE" }]}>
                <Ionicons name="help-circle" size={20} color="#0369A1" />
              </View>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                Trung tâm trợ giúp
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.7}>
            <View style={styles.leftRow}>
              <View style={[styles.iconWrapper, { backgroundColor: "#ECEFEE" }]}>
                <Ionicons name="document-text" size={20} color="#4B5563" />
              </View>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                Điều khoản dịch vụ
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.leftRow}>
              <View style={[styles.iconWrapper, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
              </View>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                Chính sách bảo mật
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* SECTION: TÀI KHOẢN NGUY HIỂM */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Khu vực nguy hiểm</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1, marginBottom: 40 }]}>
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.leftRow}>
              <View style={[styles.iconWrapper, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="trash-bin" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.settingLabel, { color: "#EF4444", fontWeight: "700" }]}>
                Xóa tài khoản vĩnh viễn
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 18,
    marginLeft: 4,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  card: { borderRadius: 16, paddingHorizontal: 16, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingLabel: { fontSize: 15, fontWeight: "500" },
});

export { SettingsScreen };
export default SettingsScreen;
