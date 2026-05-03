import { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import API from "../api/api";

export default function Home({ navigation }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  return (
    <View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>
              {item.name} - {item.price}
            </Text>

            <Button
              title="Add to cart"
              onPress={() =>
                API.post("/carts/add", {
                  product_id: item.id,
                  quantity: 1,
                })
              }
            />
          </View>
        )}
      />

      <Button title="Go to Cart" onPress={() => navigation.navigate("Cart")} />
    </View>
  );
}
