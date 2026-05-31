export const ListStoreScreens: Record<string, any> = {
  StoreBottomContainer: {
    name: "StoreBottomContainer",
    component: require("store/app-navigation/StoreBottomContainer").default,
  },
  StorePersonal: {
    name: "StorePersonal",
    component: require("store/app-views/Personal/StorePersonal").default,
  },
  StoreLanding: {
    name: "StoreLanding",
    component: require("store/app-views/StoreLanding").default,
  },
  StoreOrders: {
    name: "StoreOrders",
    component: require("store/StoreOrders").default,
  },
  StoreDashboard: {
    name: "StoreDashboard",
    component: require("store/StoreDashboard").default,
  },
  StoreProducts: {
    name: "StoreProducts",
    component: require("store/StoreProducts").default,
  },
  StoreProductForm: {
    name: "StoreProductForm",
    component: require("store/StoreProductForm").default,
  },
  StoreVouchers: {
    name: "StoreVouchers",
    component: require("store/StoreVouchers").default,
  },
  StoreSettings: {
    name: "StoreSettings",
    component: require("store/StoreSettings").default,
  },
  ShipperSettings: {
    name: "ShipperSettings",
    // Chú ý: Trỏ đường dẫn tới file ShipperSettings.tsx bạn vừa tạo nhé
    // Tớ đoán bạn đang để ở thư mục này, bạn chỉnh lại path nếu báo đỏ nha
    component: require("src/app-views/shipper/shipperSettings").default,
  },
};
