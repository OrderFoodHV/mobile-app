import HeaderApp from "@app-components/HeaderApp/HeaderApp";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { Container } from "@app-layout/Layout";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import { useState, useEffect } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AppImage from "@app-uikits/AppImage";
import { Feather } from "@expo/vector-icons";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { TextInput } from "react-native";
import { filterProducts } from "@app-helper/apiAdapters";
import { useAppTheme } from "src/app-context/ThemeContext";
const PAGE_SIZE = 6;

const categoryMap: Record<string, string> = {
  "Đồ ăn nhanh": "fast_food",
  "Đồ uống": "snacks",
  "Ăn vặt": "drinks",
};

const Search = () => {
  const { goToCart, goToProductDetail } = useNavigationComponentApp();
  const { themeColors } = useAppTheme();
  const [textSearch, setTextSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const foodCategories = ["Đồ ăn nhanh", "Đồ uống", "Ăn vặt"];

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const response = await useCallAPI({
        method: "GET",
        url: `${URL_API}/products`,
        showToast: false,
      });

      if (Array.isArray(response)) {
        setAllProducts(response);
      }

      setLoading(false);
    };

    loadProducts();
  }, []);

  const getDataFilter = (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    const currentPage = reset ? 1 : page;
    const filtered = filterProducts(allProducts, {
      page: currentPage,
      limit: PAGE_SIZE,
      type: (categorySearch || "all") as
        | "all"
        | "drinks"
        | "fast_food"
        | "snacks",
      filterColumn: "name",
      filterValue: textSearch || "",
    });

    if (reset) {
      setProducts(filtered);
      setPage(2);
    } else {
      setProducts((prev) => [...prev, ...filtered]);
      setPage((prev) => prev + 1);
    }

    setHasMore(filtered.length === PAGE_SIZE);
  };

  useEffect(() => {
    if (!allProducts.length) return;
    const delay = setTimeout(() => getDataFilter(true), 300);
    return () => clearTimeout(delay);
  }, [textSearch, categorySearch, allProducts]);

  const handleLoadMore = () => {
    if (!loading && hasMore) getDataFilter();
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={{ width: "45%", margin: 10 }}
      onPress={() => goToProductDetail({ product: item })}
    >
      <View
        style={{
          padding: 10,
          backgroundColor: "#fff",
          borderRadius: 8,
          elevation: 3,
        }}
      >
        <AppImage
          source={{ uri: item.image }}
          style={{ width: "100%", height: sizes._160sdp, borderRadius: 8 }}
        />
        <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 8 }}>
          {item.name}
        </Text>
        <Text style={{ color: "#888", marginVertical: 4 }}>
          {item.description}
        </Text>
        <Text style={{ color: "#e67e22", fontWeight: "600" }}>
          {item.price.toLocaleString()} đ
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <View
        style={{
          backgroundColor: colors.blue_primary,
          paddingTop: sizes._20sdp,
          paddingBottom: sizes._15sdp,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View
          style={{
            ...styles_c.row_direction_align_center,
            justifyContent: "space-between",
          }}
        >
          <HeaderApp title="Tìm kiếm" />

          <TouchableOpacity
            onPress={goToCart}
            style={{
              backgroundColor: colors.white,
              padding: 10,
              borderRadius: 50,
              elevation: 4,
            }}
          >
            <Feather
              name="shopping-cart"
              size={20}
              color={colors.blue_primary}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 12,
            backgroundColor: colors.white,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Feather name="search" size={18} color={colors.gray_primary} />
          <TextInput
            placeholder="Tìm món ăn..."
            value={textSearch}
            onChangeText={setTextSearch}
            style={{ marginLeft: 8, flex: 1 }}
          />
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={foodCategories}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => {
            const mappedCategory = categoryMap[item];
            const isActive = categorySearch === mappedCategory;

            return (
              <TouchableOpacity
                onPress={() =>
                  setCategorySearch(isActive ? null : mappedCategory)
                }
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  marginRight: 8,
                  borderRadius: 20,
                  backgroundColor: isActive
                    ? colors.blue_primary
                    : colors.white,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    color: isActive ? colors.white : colors.gray_primary,
                    fontWeight: "500",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 30,
        }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color={colors.blue_primary} />
          ) : null
        }
      />
    </Container>
  );
};

export default Search;
