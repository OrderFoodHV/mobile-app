import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import colors from "@assets/colors/global_colors";
import showToastApp from "@app-components/CustomToast/ShowToastApp";

const VNPayWebView: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { url, orderId } = route.params ?? {};
  const webViewRef = useRef<WebView>(null);

  // Dùng onShouldStartLoadWithRequest để chặn link TRƯỚC KHI điện thoại cố gắng kết nối
  const handleShouldStartLoadWithRequest = (request: any) => {
    const currentUrl = request.url;
    console.log("🛑 [Interceptor] Checking URL:", currentUrl);

    if (currentUrl.includes("vnp_ResponseCode")) {
      // 1. Tự phân tích dữ liệu ngay lập tức
      const getParam = (paramName: string) => {
        const match = currentUrl.match(new RegExp(`[?&]${paramName}=([^&]+)`));
        return match ? decodeURIComponent(match[1]) : null;
      };

      const responseCode = getParam("vnp_ResponseCode");
      const txnRef = getParam("vnp_TxnRef") || orderId;

      // 2. Chuyển hướng app
      if (responseCode === "00") {
        showToastApp({
          type: "success",
          text: "Thanh toán thành công! Đơn hàng đã được thanh toán qua VNPay.",
        });
        navigation.replace("OrderDetail", { orderId: txnRef });
      } else {
        showToastApp({
          type: "error",
          text: "Thanh toán thất bại! Vui lòng thử lại hoặc chọn phương thức khác.",
        });
        navigation.goBack();
      }

      // 3. TRẢ VỀ FALSE -> Cấm WebView tải trang localhost này (Triệt tiêu luôn lỗi -1004)
      return false;
    }

    // Các trang hợp lệ của VNPay (chọn thẻ, nhập OTP) thì vẫn cho tải bình thường
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            showToastApp({
              type: "info",
              text: "Đã hủy thanh toán. Bạn đã đóng trang thanh toán VNPay.",
            });
            navigation.goBack();
          }}
          style={styles.closeButton}
        >
          <Feather name="x" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán VNPay</Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            color={colors.orange_primary}
            size="large"
            style={styles.loader}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default VNPayWebView;
