import React from "react";
import { View, Text } from "react-native";

const IncomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18 }}>Tổng thu nhập của bạn</Text>
      <Text style={{ fontSize: 32, fontWeight: "bold", color: "#059669" }}>
        0 đ
      </Text>
    </View>
  );
};

export default IncomeScreen;
