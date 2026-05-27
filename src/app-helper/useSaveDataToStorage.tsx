import ServiceStorage from "@app-services/service-storage";


export const saveObjectDataToStorage = async (key: string, data: object) => {
  try {
    await ServiceStorage.setObject(key, data);
  } catch (error) {
    console.log(`Failed to save ${key} to AsyncStorage:`, error);
  }
};

export const saveStringDataToStorage = async (key: string, data: string) => {
  try {
    await ServiceStorage.setString(key, data);
  } catch (error) {
    console.log(`Failed to save string ${key} to AsyncStorage:`, error);
  }
};
