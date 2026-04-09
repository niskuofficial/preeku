const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL;
const EXPO_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

export const API_BASE: string =
  EXPO_API_URL ??
  (EXPO_DOMAIN ? `https://${EXPO_DOMAIN}` : "http://localhost:8080");

export const WS_BASE: string = API_BASE.replace(/^https/, "wss").replace(/^http/, "ws");
