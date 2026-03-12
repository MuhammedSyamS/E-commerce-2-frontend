import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || '';
// Remove trailing slash if present
rawBaseUrl = rawBaseUrl.replace(/\/$/, '');

let baseUrl = rawBaseUrl || '/api';

// If rawBaseUrl was provided but doesn't end with /api, append it
if (rawBaseUrl && !rawBaseUrl.endsWith('/api')) {
    baseUrl = `${rawBaseUrl}/api`;
}


const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

// Request Interceptor to add Auth Token automatically
// Request Interceptor to add Auth Token automatically
instance.interceptors.request.use((config) => {
    try {
        const storage = localStorage.getItem('slook-storage');
        if (storage) {
            const { state } = JSON.parse(storage);
            if (state?.user?.token) {
                config.headers.Authorization = `Bearer ${state.user.token}`;
            }
        }
    } catch (err) {
        console.error("Auth Interceptor Error:", err);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Helper for authenticated requests (deprecated but kept for compatibility)
export const getAuthConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export default instance;
