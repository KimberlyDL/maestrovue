// src\stores\auth.js
// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, {
    setAuthToken,
    clearAuthToken,
    getAuthToken,
    setRefreshToken,
    clearRefreshToken,
} from "@/utils/api";

export const useAuthStore = defineStore("auth", () => {
    // ===== state =====
    const me = computed(() => user.value)
    const pendingEmail = ref(null);
    const user = ref(null);
    const isLoading = ref(false);
    const success = ref(false);
    const isAuthenticated = computed(() => !!user.value);

    // ===== helpers =====
    function setPendingEmail(email) {
        pendingEmail.value = email || null;
    }

    async function resendVerificationEmail(email) {
        // Backend returns 204 (no content) even if the email doesn't exist — that's intended.
        await api.post("/api/email/verification-notification", { email });
        // no return value needed; just don't throw
    }

    async function fetchUser() {
        try {
            const { data } = await api.get("/api/me");
            user.value = data;
            return data;
        } catch {
            user.value = null;
            return null;
        }
    }

    async function restoreSession() {
        const token = getAuthToken();
        if (!token) {
            user.value = null;
            return null;
        }
        return await fetchUser();
    }

    // ===== actions =====
    async function testApi() {
        isLoading.value = true;
        try {
            const { data } = await api.get("/api/test-api");
            success.value = !!data?.success;
            return data;
        } finally {
            isLoading.value = false;
        }
    }

    async function signup({ email, password, password_confirmation = null }) {
        isLoading.value = true;
        try {
            const payload = { email, password };
            if (password_confirmation !== null) {
                payload.password_confirmation = password_confirmation;
            }

            const res = await api.post("/api/register", payload);

            // Backend returns 201 with { message, email }
            if (res.status === 201) {
                const data = res.data || {};
                return {
                    success: true,
                    message: data.message || "Account created. Please verify your email.",
                    email: data.email || email,
                };
            }

            // If you ever change to 204:
            if (res.status === 204) {
                return { success: true, message: "Account created. Please verify your email.", email };
            }

            // Optional: if you later decide to auto-issue tokens on register (not recommended)
            // const data = res?.data ?? {};
            // if (data?.token) setAuthToken(data.token);
            // if (data?.refresh_token) setRefreshToken(data.refresh_token);
            // if (data?.token) await fetchUser();

            // return { success: true, ...data };
        } catch (e) {
            // Show server validation nicely if available

            // {
            //     "message": "The email address field must be a valid email address. (and 3 more errors)",
            //         "errors": {
            //         "email": [
            //             "The email address field must be a valid email address."
            //         ],
            //             "password": [
            //                 "The password field must be at least 8 characters.",
            //                 "The password field must contain at least one uppercase and one lowercase letter.",
            //                 "The password field must contain at least one number."
            //             ]
            //     }
            // }

            // console.log(e);

            const responseData = e?.response?.data || {};

            const structuredErrors = {
                general: responseData.message || "Sign up failed. Please try again later.",
                email: responseData.errors?.email?.[0] || "",
                password: responseData.errors?.password?.[0] || "",
            }

            const finalError = new Error(structuredErrors.general);
            finalError.details = structuredErrors;
            throw finalError;

        } finally {
            isLoading.value = false;
        }
    }


    async function login({ email, password }) {
        isLoading.value = true;
        try {
            // Pure JWT login — backend should return { token, refresh_token? }
            const res = await api.post("/api/login", { email, password });
            const token = res?.data?.token;
            const refresh = res?.data?.refresh_token;

            if (!token) {
                return {
                    ok: false,
                    message: res?.data?.message || "Login failed: token not returned.",
                };
            }

            setAuthToken(token);
            if (refresh) setRefreshToken(refresh);

            const me = await fetchUser();
            return { ok: true, user: me };
        } catch (e) {

            console.log(e);

            const data = e?.response?.data;
            if (data?.unverified === true) {
                const err = new Error("Please verify your email before logging in.");
                err.unverified = true;
                err.email = email;
                throw err;
            }
            if (e?.response?.status === 422 || e?.response?.status === 401) {
                throw new Error(data?.message || "Invalid email or password.");
            }
            throw new Error(data?.message || e?.message || "Login failed. Please try again.",);
        } finally {
            isLoading.value = false;
        }
    }

    async function exchangeOAuthCode(code) {
        // web.php Socialite callback -> short-lived code -> /api/oauth/exchange -> { token, refresh_token?, user? }
        isLoading.value = true;
        try {
            const { data } = await api.post("/api/oauth/exchange", { code });
            const token = data?.token;
            const refresh = data?.refresh_token;

            if (!token) throw new Error("Exchange failed: token not returned.");

            setAuthToken(token);
            if (refresh) setRefreshToken(refresh);

            user.value = data.user || (await fetchUser());
            return { ok: true, user: user.value };
        } catch (e) {
            return {
                ok: false,
                message: e?.response?.data?.message || e?.message || "OAuth exchange failed.",
            };
        } finally {
            isLoading.value = false;
        }
    }

    async function logout() {
        try {
            await api.post("/api/logout"); // optional: backend can blacklist refresh / mark token used
        } catch { }
        clearAuthToken();
        clearRefreshToken();
        user.value = null;
        return { ok: true };
    }

    async function requestPasswordReset(email) {
        return api.post('/api/forgot-password', { email })
    }

    async function performPasswordReset({ token, email, password, password_confirmation }) {
        return api.post('/api/reset-password', {
            token, email, password, password_confirmation
        })
    }

    async function updateProfile(payload) {
        // email is immutable on server — do not send it
        const { data } = await api.put('/api/me/profile', payload)
        await fetchUser()
        return data
    }

    async function uploadAvatar(file) {
        const form = new FormData()
        form.append('avatar', file)
        const { data } = await api.post('/api/me/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        await fetchUser()
        return data
    }

    async function changePassword({ current_password, password, password_confirmation }) {
        const { data } = await api.post('/api/me/password', {
            current_password,
            password,
            password_confirmation,
        })
        return data
    }

    return {
        // state
        user,
        isLoading,
        isAuthenticated,
        success,
        me,
        pendingEmail,

        // actions
        requestPasswordReset,
        performPasswordReset,
        testApi,
        signup,
        login,
        exchangeOAuthCode,
        fetchUser,
        restoreSession,
        logout,
        updateProfile,
        uploadAvatar,
        changePassword,

        setPendingEmail,
        resendVerificationEmail,
    };
});
