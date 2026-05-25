import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Alert } from "react-native";
import { useSelector, shallowEqual } from "react-redux";

import { RootState } from "src/redux/store";
import useCallAPI from "../../src/app-helper/useCallAPI";
import URL_API from "../../src/app-helper/urlAPI";
import colors from "../../src/assets/colors/global_colors";

// Import các màn hình cốt lõi của Shop
import StoreOrders from "../StoreOrders";
import StoreDashboard from "../StoreDashboard";
import StoreProducts from "../StoreProducts";
import StorePersonal from "../app-views/Personal/StorePersonal";

const Tab = createBottomTabNavigator();

export default function StoreBottomContainer() {
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [storeId] = useState<number>(1);

  // 🌟 RADA QUÉT ĐƠN NGẦM TOÀN CỤC CHUẨN ĐỒNG BỘ SHOPEEFOOD
  useEffect(() => {
    if (!tokenData) return;

    const checkNewOrdersGlobal = async () => {
      try {
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/store/${storeId}/orders?status=pending`,
          token: tokenData,
        });

        if (res && res.status === "success") {
          // 🌟 BÙA HỨNG DATA HYBRID: Backend trả về kiểu gì cũng bốc trúng mảng đơn hàng!
          const actualOrders = res.data?.orders || res.data;

          if (Array.isArray(actualOrders)) {
            const newCount = actualOrders.length;

            // Nếu số lượng đơn mới lớn hơn số lượng cũ -> NỔ ĐƠN TING TING!
            if (pendingCount !== null && newCount > pendingCount) {
              Alert.alert(
                "🔔 TING TING! ĐƠN HÀNG MỚI",
                "Quán sếp vừa nhận được một đơn đặt món mới từ khách hàng! Vào duyệt ngay cho nóng sếp ơi.",
                [{ text: "XÁC NHẬN ĐÃ BIẾT" }],
              );
            }
            setPendingCount(newCount);
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
  }, [tokenData, pendingCount]);

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
