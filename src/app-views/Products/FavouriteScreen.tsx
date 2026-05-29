import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import AppImage from "@app-uikits/AppImage";
import { useSelector } from "react-redux";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";

const FavouriteScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { goToProductDetail } = useNavigationComponentApp();
  const token = useSelector((state: any) => state.auth.tokenData);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    const res = await useCallAPI({
      method: "GET",
      url: `${URL_API}/users/favorites`,
      token: token,
      showToast: false,
    });
    if (showLoading) setLoading(false);
    if (res && Array.isArray(res)) {
      setFavorites(res);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites(true);
    }, [token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites(false);
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (productId: number) => {
    const res = await useCallAPI({
      method: "DELETE",
      url: `${URL_API}/users/favorites/${productId}`,
      token: token,
      showToast: true,
      successTitle: "Đã xóa khỏi danh sách yêu thích!",
    });
    if (res && res.success !== false) {
      setFavorites((prev) => prev.filter((item) => Number(item.id) !== Number(productId)));
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => goToProductDetail({ product: item })}
    >
      <AppImage source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description || "Chưa có mô tả chi tiết."}
        </Text>
        <Text style={styles.price}>
          {Number(item.price || 0).toLocaleString("vi-VN")} đ
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Ionicons name="heart" size={22} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Container style={{ backgroundColor: "#F7F9FC" }}>
      <HeaderCustom title="Món ăn yêu thích" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.blue_primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={60} color="#9CA3AF" />
          <Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.exploreBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    lineHeight: 16,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  removeBtn: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: colors.blue_primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exploreBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default FavouriteScreen;
