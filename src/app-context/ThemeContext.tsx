import React, { createContext, useState, useContext } from "react";

// 1. Tạo Context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  themeColors: { bg: "#f5f6fa", card: "#fff", text: "#333", border: "#eee" },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 2. Định nghĩa bảng màu hệ thống
  const themeColors = {
    bg: isDarkMode ? "#121212" : "#f5f6fa", // Nền app gạt công tắc sẽ tối đi
    card: "#FFFFFF", // KHUNG CHỮ LUÔN GIỮ NỀN TRẮNG THEO ĐÚNG Ý BẠN!
    text: "#333333", // Chữ luôn giữ màu tối trên nền thẻ trắng để dễ nhìn
    border: isDarkMode ? "#2C2C2C" : "#eeeeee",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
