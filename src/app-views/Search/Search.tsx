import React from "react";
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

const Search = () => {
  const { goToCart, goToProductDetail } = useNavigationComponentApp();
  const { themeColors } = useAppTheme();
  const [textSearch, setTextSearch] = useState("");
  const [categorySearchInput, setCategorySearchInput] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          useCallAPI({
            method: "GET",
            url: `${URL_API}/products`,
            showToast: false,
          }),
          useCallAPI({
            method: "GET",
            url: `${URL_API}/products/categories`,
            showToast: false,
          })
        ]);

        if (Array.isArray(productsRes)) {
          setAllProducts(productsRes);
        } else if (productsRes && Array.isArray(productsRes.data)) {
          setAllProducts(productsRes.data);
        }

        if (Array.isArray(categoriesRes)) {
          setCategories(categoriesRes);
        } else if (categoriesRes && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data);
        }
      } catch (err) {
        console.log("Error loading search data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getDataFilter = (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    const currentPage = reset ? 1 : page;
    let filtered = allProducts;

    // 1. Lọc theo tên món ăn
    if (textSearch.trim() !== "") {
      const term = textSearch.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        (p.name || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
      );
    }

    // 2. Lọc theo tên danh mục
    if (categorySearchInput.trim() !== "") {
      const term = categorySearchInput.trim().toLowerCase();
      const matchingIds = categories
        .filter((c) => (c.name || "").toLowerCase().includes(term))
        .map((c) => Number(c.id));

      filtered = filtered.filter((p) => matchingIds.includes(Number(p.category_id)));
    }

    // 3. Phân trang
    const limit = PAGE_SIZE;
    const start = (currentPage - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    if (reset) {
      setProducts(paginated);
      setPage(2);
    } else {
      setProducts((prev) => [...prev, ...paginated]);
      setPage((prev) => prev + 1);
    }

    setHasMore(filtered.length > currentPage * limit);
  };

  useEffect(() => {
    if (!allProducts.length) return;
    const delay = setTimeout(() => getDataFilter(true), 300);
    return () => clearTimeout(delay);
  }, [textSearch, categorySearchInput, allProducts, categories]);

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
        <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 8 }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ color: "#888", marginVertical: 4 }} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={{ color: "#e67e22", fontWeight: "600" }}>
          {Number(item.price || 0).toLocaleString()} đ
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

        {/* Thanh tìm kiếm món ăn */}
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

        {/* Thanh tìm kiếm danh mục */}
        <View
          style={{
            marginTop: 8,
            backgroundColor: colors.white,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Feather name="tag" size={18} color={colors.gray_primary} />
          <TextInput
            placeholder="Tìm theo danh mục (VD: cơm, uống, vặt...)..."
            value={categorySearchInput}
            onChangeText={setCategorySearchInput}
            style={{ marginLeft: 8, flex: 1 }}
          />
        </View>
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
