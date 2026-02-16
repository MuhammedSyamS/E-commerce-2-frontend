import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Helper for authenticated requests
export const getAuthConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export default api;
