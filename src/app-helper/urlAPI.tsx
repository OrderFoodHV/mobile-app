const hostNetwork = process.env.EXPO_PUBLIC_API_IP || "192.168.0.102";
export const domain = `http://${hostNetwork}:3000`;

const URL_API = domain;

export default URL_API;
