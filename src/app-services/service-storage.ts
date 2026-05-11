import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEY_STORAGE = {
  ACCOUNT_DATA: 'ACCOUNT_DATA',
  USER_TOKEN: 'USER_TOKEN',
};
class LocalStorage {
  public getString = async (key: string, fallback?: string) => {
    const res = await AsyncStorage.getItem(key);
    try {
      if (!res) {
        return fallback;
      } else {
        return res;
      }
    } catch (e) {
      return fallback;
    }
  };

  public setString = (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  };

  public getObject = async (key: string, fallback = {}) => {
    const res = await AsyncStorage.getItem(key);

    try {
      if (!res) {
        return fallback;
      } else {
        return JSON.parse(res);
      }
    } catch (e) {
      return fallback;
    }
  };

  public setObject = (key: string, value: { [key: string]: any }) => {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  };

  public getBoolean = async (key: string) => {
    const res = await AsyncStorage.getItem(key);

    return res === 'true';
  };

  public setBoolean = (key: string, value: boolean) => {
    const value_set = value === true ? 'true' : 'false';

    return AsyncStorage.setItem(key, value_set);
  };

  public clearAll = async () => {
    const res = await AsyncStorage.clear();
    return res;
  };
}
const ServiceStorage = new LocalStorage()
export default ServiceStorage;
