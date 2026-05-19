export const ListStoreScreens: Record<string, any> = {
  StoreBottomContainer: {
    name: "StoreBottomContainer",
    component: require("./StoreBottomContainer").default,
  },
  StorePersonal: {
    name: "StorePersonal",
    component: require("../app-views/Personal/StorePersonal").default,
  },
  StoreOrders: {
    name: "StoreOrders",
    component: require("../StoreOrders").default,
  },
  StoreDashboard: {
    name: "StoreDashboard",
    component: require("../StoreDashboard").default,
  },
  StoreProducts: {
    name: "StoreProducts",
    component: require("../StoreProducts").default,
  },
  StoreProductForm: {
    name: "StoreProductForm",
    component: require("../StoreProductForm").default,
  },
  StoreVouchers: {
    name: "StoreVouchers",
    component: require("../StoreVouchers").default,
  },
};
