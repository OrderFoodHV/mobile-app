import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

// 🌟 Import các màn hình chuẩn
import shipperHome from "src/app-views/shipper/shipperHome";
import shipperWallet from "src/app-views/shipper/shipperWallet";
// Sửa lại đường dẫn import này cho khớp với thư mục của sếp nếu cần nhé
import shipperPersonal from "src/app-views/shipper/shipperPersonal";

const Tab = createBottomTabNavigator();

export default function ShipperBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#F97316" }}
    >
      <Tab.Screen
        name="ShipperHomeTab"
        component={shipperHome}
        options={{
          tabBarLabel: "Nhận đơn",
          tabBarIcon: ({ color }) => (
            <Feather name="navigation" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ShipperWalletTab"
        component={shipperWallet}
        options={{
          tabBarLabel: "Thu nhập",
          tabBarIcon: ({ color }) => (
            <Feather name="pie-chart" size={24} color={color} />
          ),
        }}
      />
      {/* 🌟 THÊM MÀN HÌNH CÁ NHÂN TÀI XẾ VÀO ĐÂY */}
      <Tab.Screen
        name="ShipperPersonalTab"
        component={shipperPersonal}
        options={{
          tabBarLabel: "Cá nhân",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
