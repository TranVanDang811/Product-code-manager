import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEY_API_URL = 'pcm_mobile_api_url';

export const CLOUDFLARE_TUNNEL_URL =
  process.env.EXPO_PUBLIC_CLOUDFLARE_URL || 'https://executive-stored-execute-device.trycloudflare.com/api/v1';
export const LOCAL_LAN_URL =
  process.env.EXPO_PUBLIC_LOCAL_LAN_URL || 'http://192.168.100.137:8080/api/v1';

// Default host: Cloudflare Tunnel allows 4G/5G/any Wi-Fi access outside the home
const getDefaultHost = () => {
  return CLOUDFLARE_TUNNEL_URL;
};

export let API_BASE_URL = getDefaultHost();

export async function initApiConfig() {
  try {
    const saved = await SecureStore.getItemAsync(STORAGE_KEY_API_URL);
    if (saved) {
      API_BASE_URL = saved;
    }
  } catch (err) {
    console.warn('Failed to read API_BASE_URL from SecureStore', err);
  }
  return API_BASE_URL;
}

export async function setCustomApiUrl(url) {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.endsWith('/api/v1')) {
      cleanUrl = cleanUrl.replace(/\/+$/, '') + '/api/v1';
    }
    API_BASE_URL = cleanUrl;
    await SecureStore.setItemAsync(STORAGE_KEY_API_URL, cleanUrl);
    return cleanUrl;
  } catch (err) {
    console.error('Failed to save API_BASE_URL', err);
    throw err;
  }
}

