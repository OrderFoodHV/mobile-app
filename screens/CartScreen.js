import { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import API from "../api/api";

export default function Cart({ navigation }) {
  const [cart, setCart] = useState([]);

  const loadCart = () => {
    API.get("/carts").then((res) => setCart(res.data));
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <View>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.product_id.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.name} x {item.quantity} = {item.total}
          </Text>
        )}
      />

      <Button
        title="Checkout"
        onPress={async () => {
          await API.post("/orders/create", {
            address: "KTX",
          });
          navigation.navigate("Orders");
        }}
      />
    </View>
  );
}
