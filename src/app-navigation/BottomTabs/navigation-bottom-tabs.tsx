import { useOnEventCallback } from "@app-helper/hooks";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, View } from "react-native";
import BottomTab from "./BottomTab";
import styles from "./NavigationBottom.styles";
import sizes from "@assets/styles/sizes";
const MAIN_TAB_COLOR = "#3498db";
const Tab = createBottomTabNavigator();

// 2. Chèn 'Thông báo' vào danh sách các màn hình
enum MainTab {
  Home = "Trang chủ",
  Search = "Tìm kiếm",
  Notification = "Thông báo", // 🌟 MỚI THÊM
  Order = "Đơn hàng",
  Personal = "Cá nhân",
}

// 3. Khai báo icon và đường dẫn cho 5 tab
const Tabs = [
  {
    name: MainTab.Home,
    screen: require("@app-views/Home/Home").default,
    icon: (color: string) => (
      <Entypo name="home" color={color} size={sizes._24sdp} />
    ),
  },
  {
    name: MainTab.Search,
    screen: require("@app-views/Search/Search").default,
    icon: (color: string) => (
      <AntDesign name="search" color={color} size={sizes._24sdp} />
    ),
  },
  {
    name: MainTab.Notification, // 🌟 TAB THÔNG BÁO Ở VỊ TRÍ SỐ 3 (GIỮA MÀN HÌNH)
    screen: require("@app-views/Notification/Notification").default,
    icon: (color: string) => (
      <MaterialIcons
        name="notifications-none"
        color={color}
        size={sizes._24sdp}
      />
    ),
  },
  {
    name: MainTab.Order,
    screen: require("@app-views/Order/OrderList").default,
    icon: (color: string) => (
      <Ionicons name="receipt-outline" color={color} size={sizes._24sdp} />
    ),
  },
  {
    name: MainTab.Personal,
    screen: require("@app-views/Personal/Personal").default,
    icon: (color: string) => (
      <AntDesign name="user" color={color} size={sizes._24sdp} />
    ),
  },
];
type Props = {
  route: any;
  navigation: any;
};

const BottomTabs: React.FC<Props> = ({ route }) => {
  const initialScreenName = route?.params?.screenName || MainTab.Home;

  const CustomTabar = useOnEventCallback((props: BottomTabBarProps) => {
    const { descriptors, navigation, state } = props;

    return (
      <View
        style={{
          borderRadius: 50,
          height: Platform.OS === "ios" ? 85 : 70,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          backgroundColor: "#fff",
        }}
      >
        <View style={styles.container}>
          <View style={styles.viewTab}>
            {state.routes.map((tabRoute, index) => {
              const { options } = descriptors[tabRoute.key];
              const screenName = tabRoute.name as MainTab;
              const tab = Tabs.find((item) => item.name === screenName);
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: tabRoute.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(tabRoute.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: tabRoute.key,
                });
              };

              const color = isFocused ? MAIN_TAB_COLOR : "black";

              return (
                <BottomTab
                  key={tabRoute.key}
                  icon={tab?.icon(color)}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  isActive={isFocused}
                  onLongPress={onLongPress}
                  onPress={onPress}
                  index={index}
                  name={tabRoute.name}
                />
              );
            })}
          </View>
        </View>
      </View>
    );
  });

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialScreenName}
      tabBar={CustomTabar}
    >
      {Tabs.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.screen}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomTabs;
