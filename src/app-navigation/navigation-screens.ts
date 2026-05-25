// src/navigation/navigation-screens.ts

// --- Màn hình User ---
const UserScreens = {
  Home: { name: "Home", component: require("@app-views/Home/Home").default },
  Search: {
    name: "Search",
    component: require("@app-views/Search/Search").default,
  },
  Notification: {
    name: "Notification",
    component: require("@app-views/Notification/Notification").default,
  },
  Personal: {
    name: "Personal",
    component: require("@app-views/Personal/Personal").default,
  },
  Cart: { name: "Cart", component: require("@app-views/Cart/Cart").default },
  Order: {
    name: "Order",
    component: require("@app-views/Order/Order").default,
  },
  OrderList: {
    name: "OrderList",
    component: require("@app-views/Order/OrderList").default,
  },
  OrderDetail: {
    name: "OrderDetail",
    component: require("@app-views/Order/OrderDetail").default,
  },
  OrderInfo: {
    name: "OrderInfo",
    component: require("@app-views/Order/OrderInfo").default,
  },
  Splash: {
    name: "Splash",
    component: require("@app-views/Splash/Splash").default,
  },
  Login: {
    name: "Login",
    component: require("@app-views/LoginAndRegister/Login").default,
  },
  Register: {
    name: "Register",
    component: require("@app-views/LoginAndRegister/Register").default,
  },
  ProductDetail: {
    name: "ProductDetail",
    component: require("@app-views/Products/ProductDetail").default,
  },
  BottomContainer: {
    name: "BottomContainer",
    component: require("@app-navigation/BottomTabs/BottomContainer").default,
  },
  ProfileDetail: {
    name: "ProfileDetail",
    component: require("@app-views/Personal/ProfileDetail").default,
  },
  AddressScreen: {
    name: "AddressScreen",
    component: require("@app-views/Personal/AddressScreen").default,
  },
  SettingsScreen: {
    name: "SettingsScreen",
    component: require("@app-views/Personal/SettingsScreen").default,
  },
};

// --- Màn hình Shipper ---
const ShipperScreens = {
  ShipperLanding: {
    name: "ShipperLanding",
    component: require("src/app-views/shipper/shipperlanding").default,
  },
  ShipperBottomContainer: {
    name: "ShipperBottomContainer",
    component: require("src/app-views/shipper/shipperBottomTabs").default,
  },
};

// --- Màn hình Store (Chuẩn bị cho tương lai) ---
const StoreScreens = {
  StoreLanding: {
    name: "StoreLanding",
    component: require("../../store/app-views/StoreLanding").default,
  },
  StoreBottomContainer: {
    name: "StoreBottomContainer",
    // Trỏ đường dẫn về đúng file StoreBottomContainer bên thư mục store
    component: require("../../store/app-navigation/StoreBottomContainer")
      .default,
  },
};

// --- Gộp tất cả ---
export const ListStackScreens: Record<string, any> = {
  ...UserScreens,
  ...ShipperScreens,
  ...StoreScreens,
};
