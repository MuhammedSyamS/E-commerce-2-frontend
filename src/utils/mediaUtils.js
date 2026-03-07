/**
 * Resolves media URLs by prepending the backend URL to local paths (starting with /uploads).
 * Returns absolute URLs as-is.
 * @param {string} path - The image or video path
 * @returns {string} - The resolved absolute URL
 */
export const resolveMediaURL = (path) => {
    if (!path) return '';

    // If it's already an absolute URL (http/https), Base64, or blob, return as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }

    // Get the base API URL and extract the domain (remove /api if it's at the end)
    let apiURL = import.meta.env.VITE_API_URL || '';
    // Normalize: remove trailing slash and /api suffix for the media base
    let mediaBase = apiURL.replace(/\/$/, '').replace(/\/api$/, '');

    // Ensure the path starts with /uploads/ if it doesn't already
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (!normalizedPath.startsWith('/uploads/')) {
        normalizedPath = `/uploads${normalizedPath}`;
    }

    // Return the combined URL, ensure no double slashes between domain and path
    return `${mediaBase}${normalizedPath}`.replace(/([^:]\/)\/+/g, "$1");
};
