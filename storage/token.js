// storage/token.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "inorder_user_token";
const USER_INFO_KEY = "inorder_user_info";
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error("Lỗi lưu token", e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error("Lỗi lấy token", e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error("Lỗi xóa token", e);
  }
};
export const storeUser = async (userObj) => {
  try {
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userObj));
  } catch (e) {
    console.error("Lỗi lưu User");
  }
};

export const getUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem(USER_INFO_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_INFO_KEY);
  } catch (e) {}
};
