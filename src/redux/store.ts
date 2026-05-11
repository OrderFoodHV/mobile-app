import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import productListReducer from './features/productListSlice';
import cartReducer from './features/cartSlice';
import orderReducer from './features/orderSlice';



const store = configureStore({
  reducer: {
   auth: authReducer,
   productList: productListReducer,
   cart: cartReducer,
   order: orderReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
