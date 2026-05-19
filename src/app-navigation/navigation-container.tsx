import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ListStackScreens } from "./navigation-screens"; // Danh sách màn hình của Khách
import { ListStoreScreens } from "../../store/app-navigation/navigation-screens"; // Danh sách màn hình của Shop nạp từ bên ngoài sang

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* 1. Tự động nạp toàn bộ màn hình của Khách */}
        {Object.values(ListStackScreens).map((screen, index) => (
          <Stack.Screen
            key={`customer-${index}`}
            name={screen.name}
            component={screen.component}
          />
        ))}

        {/* 2. Tự động nạp toàn bộ màn hình của Shop từ folder riêng biệt */}
        {Object.values(ListStoreScreens).map((screen, index) => (
          <Stack.Screen
            key={`store-${index}`}
            name={screen.name}
            component={screen.component}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
