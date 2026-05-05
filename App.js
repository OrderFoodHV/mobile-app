import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Nhập toàn bộ màn hình của hệ thống InOrder
import ShipperHomeScreen from "./screens/ShipperHomeScreen";

import CartScreen from "./screens/CartScreen";

import CheckoutScreen from "./screens/CheckoutScreen";

import HomeScreen from "./screens/HomeScreen";

import LoginScreen from "./screens/LoginScreen";

import OrderDetailScreen from "./screens/OrderDetailScreen";

import OrderHistory from "./screens/OrderHistory";

import ProductDetail from "./screens/ProductDetail";

import ProfileScreen from "./screens/ProfileScreen";

import RegisterScreen from "./screens/RegisterScreen";

import TrackingScreen from "./screens/TrackingScreen";

import WelcomeScreen from "./screens/WelcomeScreen";

// 👉 TẠO STACK
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ShipperHomeScreen">
        {/* Nhóm màn hình không cần hiện thanh tiêu đề phía trên */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        {/* Nhóm màn hình chính của App */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Trang chủ", headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetail}
          options={{ title: "Chi tiết món ăn" }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: "Giỏ hàng của bạn" }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: "Thanh toán" }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistory}
          options={{ title: "Lịch sử đơn hàng" }}
        />
        <Stack.Screen
          name="ShipperHomeScreen"
          component={ShipperHomeScreen}
          options={{ title: "Ship" }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ title: "Chi tiết đơn hàng" }}
        />
        <Stack.Screen
          name="TrackingScreen"
          component={TrackingScreen}
          options={{ title: "Lộ trình giao hàng" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Trang cá nhân" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
