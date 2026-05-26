import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Alert } from "react-native";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { RootState } from "src/redux/store";
import useCallAPI from "../../src/app-helper/useCallAPI";
import URL_API from "../../src/app-helper/urlAPI";
import colors from "../../src/assets/colors/global_colors";
import socket from "../../src/app-helper/socketHelper";
import { updateAuthInfor } from "../../src/redux/features/authSlice";

// Import các màn hình cốt lõi của Shop
import StoreOrders from "../StoreOrders";
import StoreDashboard from "../StoreDashboard";
import StoreProducts from "../StoreProducts";
import StorePersonal from "../app-views/Personal/StorePersonal";

const Tab = createBottomTabNavigator();

export default function StoreBottomContainer() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { tokenData, account } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  // Dùng ref thay cho state để tránh effect khởi động lại mỗi lần đếm thay đổi
  const pendingCountRef = useRef<number | null>(null);
  const isSeller = account?.is_seller === 1 || account?.is_seller === "1" || Number(account?.is_seller) === 1;
  const storeId = account?.storeId;

  // 🔴 LẮNG NGHE SỰ KIỆN QUÁN BỊ XÓA ĐỂ ĐẨY USER RA KHỎI KÊNH NGƯỜI BÁN NGAY LẬP TỨC
  useEffect(() => {
    if (!tokenData) return;

    socket.on("store_deleted", (data: any) => {
      console.log("🏪 [Socket Store] Nhận thông báo quán bị xóa:", data);

      // 1. Thu hồi quyền người bán trên Redux & LocalStorage
      dispatch(
        updateAuthInfor({
          is_seller: 0,
          storeId: null,
          storeName: null,
          storeStatus: null,
        })
      );

      // 2. Alert cảnh báo cho chủ quán và đẩy ra ngoài
      Alert.alert(
        "Cảnh báo hệ thống ❌",
        data.message || "Cửa hàng của sếp đã bị Admin gỡ khỏi hệ thống. Hệ thống sẽ đưa sếp về trang chính.",
        [
          {
            text: "XÁC NHẬN",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "BottomContainer" }],
              });
            },
          }
        ]
      );
    });

    return () => {
      socket.off("store_deleted");
    };
  }, [tokenData, dispatch, navigation]);

  // 🌟 RADA QUÉT ĐƠN NGẦM TOÀN CỤC CHUẨN ĐỒNG BỘ SHOPEEFOOD
  useEffect(() => {
    if (!tokenData || !isSeller || !storeId) return;

    const checkNewOrdersGlobal = async () => {
      try {
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/store/${storeId}/orders?status=pending`,
          token: tokenData,
        });

        if (res) {
          // 🌟 BÙA HỨNG DATA HYBRID: Backend trả về kiểu gì cũng bốc trúng mảng đơn hàng!
          const actualOrders = res.orders || res.data?.orders || res.data || res;

          if (Array.isArray(actualOrders)) {
            const newCount = actualOrders.length;

            // Nếu số lượng đơn mới lớn hơn số lượng cũ -> NỔ ĐƠN TING TING!
            if (pendingCountRef.current !== null && newCount > pendingCountRef.current) {
              Alert.alert(
                "🔔 TING TING! ĐƠN HÀNG MỚI",
                "Quán sếp vừa nhận được một đơn đặt món mới từ khách hàng! Vào duyệt ngay cho nóng sếp ơi.",
                [{ text: "XÁC NHẬN ĐÃ BIẾT" }],
              );
            }
            pendingCountRef.current = newCount;
          }
        }
      } catch (e) {
        console.log("Rada ngầm lỗi:", e);
      }
    };

    // Quét phát đầu tiên ngay khi vào kênh Shop
    checkNewOrdersGlobal();

    // Thiết lập chu kỳ quét 8 giây một lần cho thần tốc
    const interval = setInterval(checkNewOrdersGlobal, 8000);
    return () => clearInterval(interval);
  }, [tokenData, storeId]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blue_primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: { backgroundColor: "#fff", paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen
        name="StoreOrdersTab"
        component={StoreOrders}
        options={{
          tabBarLabel: "Đơn hàng",
          tabBarIcon: ({ color }) => (
            <Feather name="shopping-bag" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StoreDashboardTab"
        component={StoreDashboard}
        options={{
          tabBarLabel: "Thống kê",
          tabBarIcon: ({ color }) => (
            <Feather name="bar-chart-2" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StoreProductsTab"
        component={StoreProducts}
        options={{
          tabBarLabel: "Thực đơn",
          tabBarIcon: ({ color }) => (
            <Feather name="list" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StorePersonalTab"
        component={StorePersonal}
        options={{
          tabBarLabel: "Cá nhân",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
