import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || '';

// If empty or relative, default to /api
if (!baseUrl || baseUrl === '/') {
    baseUrl = '/api';
}

// Remove trailing slash and ensure /api suffix if not present
baseUrl = baseUrl.replace(/\/$/, '');
if (!baseUrl.endsWith('/api') && baseUrl.startsWith('http')) {
    baseUrl = `${baseUrl}/api`;
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
