import HeaderApp from "@app-components/HeaderApp/HeaderApp"
import SearchBar from "@app-components/SearchBar/SearchBar"
import { Container, Content } from "@app-layout/Layout"
import colors from "@assets/colors/global_colors"
import sizes from "@assets/styles/sizes"
import styles_c from "@assets/styles/styles_c"
import { useEffect, useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { Feather } from '@expo/vector-icons';
import ListProductTabBar from "./components/ListProductTabBar"
import { useNavigationComponentApp } from "@app-helper/navigateToScreens"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@redux/store"
import { getCartData } from "@redux/features/cartSlice"
import React from "react"
import useCallAPI from "@app-helper/useCallAPI"
import URL_API from "@app-helper/urlAPI"

interface HomeProps { }
const Home: React.FC<HomeProps> = () => {
  const { goToCart } = useNavigationComponentApp()
  const [textSearch, setTextSearch] = useState<string>('')
  
  const getProductData = async () => {
    const response = await useCallAPI({
      method: "GET",
      url: `${URL_API}/products`,
    });
  }

  const receiveTextSearch = (text: string) => {
    setTextSearch(textSearch)
  }
  const dispatch = useDispatch<AppDispatch>();
  const { hasFetchedCartData } = useSelector((state: RootState) => state.cart, shallowEqual)
  const { tokenData } = useSelector((state: RootState) => state.auth, shallowEqual)
  useEffect(() => {
    if (!hasFetchedCartData && tokenData) {
      dispatch(getCartData(tokenData))
    }
  }, [tokenData, hasFetchedCartData])

  return (
  <Container style={{ flex: 1, backgroundColor: colors.gray_light }}>
    {/* HEADER */}
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
      <View style={{ ...styles_c.row_direction_align_center, justifyContent: 'space-between' }}>
        {/* TITLE */}
        <HeaderApp title="Trang chủ" />

        {/* CART */}
        <TouchableOpacity
          onPress={() => goToCart()}
          style={{
            backgroundColor: colors.white,
            padding: 10,
            borderRadius: 50,
            elevation: 4,
          }}
        >
          <Feather
            name="shopping-cart"
            size={sizes._22sdp}
            color={colors.blue_primary}
          />
        </TouchableOpacity>
      </View>
    </View>

    {/* CONTENT */}
    <View style={{ flex: 1, marginTop: 10 }}>
      <ListProductTabBar />
    </View>
  </Container>
  )
}
export default Home