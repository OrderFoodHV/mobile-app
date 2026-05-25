import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StoreLanding from "store/app-views/StoreLanding";

// 1. Danh sách màn hình của Khách
import { ListStackScreens } from "src/app-navigation/navigation-screens";

// 2. 🌟 IMPORT THÊM DANH SÁCH MÀN HÌNH CỦA CỬA HÀNG (Sửa đường dẫn nếu báo đỏ nhé)
import { ListStoreScreens } from "store/app-navigation/navigation-screens";

// 3. 🌟 GỘP CẢ 2 MODULE LẠI THÀNH 1 DANH SÁCH TỔNG
const AllScreens = {
  ...ListStackScreens,
  ...ListStoreScreens, // Nhét cục này vào thì StoreVouchers mới được đăng ký!
};

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Bây giờ mình map cái AllScreens tổng, nó sẽ chứa đủ 100% màn hình */}
        {Object.values(AllScreens).map((screen: any) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
