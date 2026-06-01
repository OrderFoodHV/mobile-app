import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { filterProducts } from "@app-helper/apiAdapters";

interface SearchBarProps {
  recieveText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ recieveText }) => {
  const [text, setText] = useState("");
  const [debouncedText] = useDebounce(text, 500);
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const { goToProductDetail } = useNavigationComponentApp();

  useEffect(() => {
    const loadProducts = async () => {
      if (!text.trim()) {
        setData([]);
        return;
      }

      const response = await useCallAPI({
        method: "GET",
        url: `${URL_API}/products`,
      });

      if (Array.isArray(response)) {
        setData(
          filterProducts(response, {
            page: 1,
            limit: 8,
            filterColumn: "name",
            filterValue: text,
          }),
        );
      }
    };

    loadProducts();
  }, [text]);

  useEffect(() => {
    if (debouncedText) {
      recieveText(debouncedText);
    }
  }, [debouncedText, recieveText]);

  return (
    <View style={{ position: "relative" }}>
      <View style={[styles.searchContainer]}>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconTouch}>
            <FontAwesome name="microphone" size={sizes._24sdp} color={colors.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Tìm kiếm"
            value={text}
            onChangeText={(val) => {
              setText(val);
              setShowDropdown(val.length > 0);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            style={styles.input}
          />
        </View>

        {text !== "" && (
          <View style={styles.clearIconContainer}>
            <TouchableOpacity onPress={() => setText("")} style={styles.clearButton}>
              <AntDesign name="close-circle" size={sizes._23sdp} color={colors.text_gray} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showDropdown && text.length > 0 && (
        <View style={[styles.dropdown, { zIndex: 999 }]} pointerEvents="box-none">
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={data || []}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                activeOpacity={0.7}
                onPress={() => {
                  goToProductDetail({ product: item });
                  setShowDropdown(false);
                  setText(item.name);
                }}
              >
                <Text>{item?.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: colors.white,
    width: "100%",
    borderRadius: 8,
    padding: 5,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  iconContainer: {
    width: "10%",
  },
  iconTouch: {
    padding: 5,
  },
  inputContainer: {
    width: "78%",
  },
  input: {
    paddingVertical: 5,
    paddingHorizontal: 0,
  },
  clearIconContainer: {
    width: "12%",
    position: "relative",
  },
  clearButton: {
    position: "absolute",
    top: -12,
    right: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 20,
    maxHeight: 200,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
