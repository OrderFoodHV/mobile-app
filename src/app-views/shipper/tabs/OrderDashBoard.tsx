import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);

  // Lấy đơn hàng từ Backend
  const fetchOrders = async () => {
    const res = await useCallAPI({
      method: "GET",
      url: `${URL_API}/shippers/orders`,
    });
    if (res?.success) setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId: number) => {
    const res = await useCallAPI({
      method: "PATCH",
      url: `${URL_API}/shippers/accept/${orderId}`,
    });
    if (res?.success) {
      Alert.alert("Thành công", "Đã nhận đơn!");
      fetchOrders(); // Load lại danh sách
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Đơn hàng khả dụng
      </Text>
      <FlatList
        data={orders}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderBottomWidth: 1 }}>
            <Text>
              Đơn hàng #{item.id} - Giá: {item.total_price}đ
            </Text>
            <TouchableOpacity
              onPress={() => handleAccept(item.id)}
              style={{ backgroundColor: "#3B82F6", padding: 10, marginTop: 5 }}
            >
              <Text style={{ color: "#fff" }}>Nhận đơn</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default OrderDashboard;
