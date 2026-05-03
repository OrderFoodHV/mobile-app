import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import API from "../api/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/orders/history").then((res) => {
      setOrders(res.data);
    });
  }, []);

  return (
    <View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>
            Order #{item.id} - {item.status} - {item.total_price}
          </Text>
        )}
      />
    </View>
  );
}
