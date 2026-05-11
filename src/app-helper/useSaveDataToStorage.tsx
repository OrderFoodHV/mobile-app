import ServiceStorage from "@app-services/service-storage";


export const saveObjectDataToStorage = async (key: string, data: object) => {
  try {
    await ServiceStorage.setObject(key, data);
  } catch (error) {
    console.log(`Failed to save ${key} to AsyncStorage:`, error);
  }
};
