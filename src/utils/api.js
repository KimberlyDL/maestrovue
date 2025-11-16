// src/utils/api.js
import axios from "axios";

// ====== Config ======
const API_ORIGIN =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

const TOKEN_KEY = "jwt";
const REFRESH_TOKEN_KEY = "jwt_refresh"; // optional if your backend issues refresh tokens

// ====== Axios base instance ======
const api = axios.create({
    baseURL: API_ORIGIN,
    // Cross-site + JWT = no cookies; you can omit withCredentials entirely (defaults to false)
    withCredentials: false,
    timeout: 20000,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    },
});

// ====== Token helpers ======
export function getAuthToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
        return null;
    }
}

export function setAuthToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch { }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch { }
    delete api.defaults.headers.common.Authorization;
}

export function getRefreshToken() {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY) || null;
    } catch {
        return null;
    }
}

export function setRefreshToken(token) {
    try {
        if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch { }
}

export function clearRefreshToken() {
    try {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch { }
}

// Re-init token on load
const bootToken = getAuthToken();
if (bootToken) setAuthToken(bootToken);

// ====== Interceptors ======
const RETRY_FLAG = Symbol("retried");

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
        // keep clean if token was cleared
        delete config.headers.Authorization;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const { config, response } = error;
        if (!response) return Promise.reject(error);

        const status = response.status;

        // ====== OPTIONAL: automatic refresh on 401 if you implement refresh tokens ======
        // Backend contract assumed:
        // POST /api/auth/refresh  { refresh_token }  -> { token, refresh_token? }
        if (status === 401 && config && !config[RETRY_FLAG]) {
            const refresh = getRefreshToken();
            if (refresh) {
                try {
                    const { data } = await axios.post(
                        `${API_ORIGIN}/api/auth/refresh`,
                        { refresh_token: refresh },
                        { timeout: 15000 }
                    );
                    const newAccess = data?.token;
                    const newRefresh = data?.refresh_token;

                    if (!newAccess) throw new Error("No token from refresh");

                    setAuthToken(newAccess);
                    if (newRefresh) setRefreshToken(newRefresh);

                    const retryConfig = { ...config, [RETRY_FLAG]: true };
                    retryConfig.headers = {
                        ...(retryConfig.headers || {}),
                        Authorization: `Bearer ${newAccess}`,
                    };
                    return api.request(retryConfig);
                } catch (e) {
                    // fall through to clear
                }
            }
            // No refresh token or refresh failed → clear & bubble up
            clearAuthToken();
            clearRefreshToken();
        }

        return Promise.reject(error);
    }
);

// ====== Helpers ======
export async function logoutEverywhere() {
    try {
        // optional: if backend invalidates refresh/blacklists access tokens
        await api.post("/api/logout");
    } catch { }
    clearAuthToken();
    clearRefreshToken();
}

export default api;
