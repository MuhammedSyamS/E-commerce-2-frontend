/**
 * Resolves media URLs by prepending the backend URL to local paths (starting with /uploads).
 * Returns absolute URLs as-is.
 * @param {string} path - The image or video path
 * @returns {string} - The resolved absolute URL
 */
export const resolveMediaURL = (path) => {
    if (!path) return '';

    // If it's already an absolute URL (http/https), return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Get backend base URL from environment
    const apiURL = import.meta.env.VITE_API_URL || '';
    const baseURL = apiURL.replace(/\/api$/, ''); // Remove /api suffix if present

    // Ensure path starts with / if it doesn't
    const standardizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseURL}${standardizedPath}`;
};
