import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { Container, Content } from "@app-layout/Layout";
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

const SettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { replaceScreen } = useNavigationServices();
  const { isDarkMode, toggleTheme, themeColors } = useAppTheme();
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );

  // 🚨 LUỒNG XỬ LÝ XÓA TÀI KHOẢN AN TOÀN TUYỆT ĐỐI
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
              // 1. Gọi API xóa tài khoản dưới Backend
              await useCallAPI({
                method: "DELETE",
                url: `${URL_API}/users/delete-account`, // Sếp check lại endpoint delete bên auth router của bạn sếp nhé
                token: tokenData,
                showToast: true,
                successTitle: "Đã xóa tài khoản vĩnh viễn!",
              });

              // 2. Dọn dẹp sạch sẽ dữ liệu cục bộ trên điện thoại (Tránh lỗi phân quyền)
              await ServiceStorage.clearAll();
              dispatch(resetAllAuth());
              dispatch(resetAllCart());
              dispatch(resetAllOrderData());
              dispatch(resetAllProductListData());

              // 3. Đá bay user về màn hình Đăng nhập công lý
              replaceScreen("Login");
            } catch (error) {
              console.log("Lỗi khi xóa tài khoản:", error);
              Alert.alert(
                "Lỗi hệ thống",
                "Không thể thực hiện xóa tài khoản lúc này, sếp kiểm tra lại Backend nhen!",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <Container style={{ backgroundColor: themeColors.bg }}>
      <HeaderCustom title="Cài đặt hệ thống" isShowLeftButton={true} />
      <Content style={styles.container}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              borderWidth: 1,
            },
          ]}
        >
          {/* CÔNG TẮC DARK MODE */}
          <View
            style={[
              styles.settingRow,
              { borderBottomColor: themeColors.border },
            ]}
          >
            <Text style={[styles.settingLabel, { color: themeColors.text }]}>
              Giao diện tối (Dark Mode)
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
            />
          </View>

          {/* NÚT XÓA TÀI KHOẢN CẢNH BÁO ĐỎ */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            onPress={handleDeleteAccount}
          >
            <Text
              style={[
                styles.settingLabel,
                { color: "#EF4444", fontWeight: "700" },
              ]}
            >
              Xóa tài khoản vĩnh viễn
            </Text>
            <Text style={{ color: "#EF4444", fontSize: 16, fontWeight: "700" }}>
              &gt;
            </Text>
          </TouchableOpacity>
        </View>
      </Content>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 16, paddingHorizontal: 16, elevation: 2 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLabel: { fontSize: 15, fontWeight: "500" },
});

export { SettingsScreen };
export default SettingsScreen;
