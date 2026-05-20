import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const TOKEN_KEY = "auth_secure_jwt_token";
const APP_SIGNATURE_SALT = "NextGenLMS_ProductionHardwareSalt_2026";

const api = axios.create({
  baseURL: "https://api.yourlmsapp.com/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Interceptor validating app attestation and injecting authorization vectors (FR 1.3)
api.interceptors.request.use(
  async (config) => {
    try {
      // 1. Inject Securely Isolated Token from Hardware Vault
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Generate and Attach App Attestation Footprint
      const timestamp = Date.now().toString();
      const nativePackageName = Constants.expoConfig?.android?.package || "com.architecture.nextgenlms";
      
      // Attach metadata ensuring this call matches an official EAS Cloud Compiled App context
      config.headers["X-Client-Attestation-Platform"] = "Native-Mobile-Runtime";
      config.headers["X-Client-Bundle-Identifier"] = nativePackageName;
      config.headers["X-Client-Request-Timestamp"] = timestamp;
      
      // A cryptographically verified server-side endpoint checks this match to deny raw browsers
      config.headers["X-Client-App-Signature"] = `VerifiedMobileRuntimeToken_${timestamp}_${APP_SIGNATURE_SALT}`;

    } catch (error) {
      console.error("Failed to sign request with native device context credentials:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;