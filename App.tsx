import React from "react";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import AppNavigator from "./src/app-navigation/navigation-container";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "./src/app-context/ThemeContext"; // 👉 Đường dẫn này tùy thuộc vào nơi bạn đặt file ở mục 3 nhen
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {/* 🌟 Bọc ThemeProvider vào đây để TẤT CẢ các màn hình con đều dùng được Dark Mode */}
          <ThemeProvider>
            {/* Giao diện điều hướng gốc thật của dự án bạn */}
            <AppNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
