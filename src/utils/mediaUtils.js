/**
 * Resolves media URLs by prepending the backend URL to local paths (starting with /uploads).
 * Returns absolute URLs as-is.
 * Supports Cloudinary transformations via options.
 * @param {string} path - The image or video path
 * @param {object} options - Optional transformations (e.g., { width: 400, quality: 'auto' })
 * @returns {string} - The resolved absolute URL
 */
export const resolveMediaURL = (path, options = {}) => {
    if (!path) return '';

    // Fix backslashes
    path = path.replace(/\\\\/g, '/');

    // If it's already an absolute URL (http/https), Base64, or blob
    let finalUrl = path;
    if (!(path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:'))) {
        // Get the base API URL and extract the domain (remove /api if it's at the end)
        let apiURL = import.meta.env.VITE_API_URL || '';
        let mediaBase = apiURL.replace(/\/$/, '').replace(/\/api$/, '');

        // Ensure the path starts with /uploads/ if it doesn't already
        let normalizedPath = path.startsWith('/') ? path : `/${path}`;
        if (!normalizedPath.startsWith('/uploads/')) {
            normalizedPath = `/uploads${normalizedPath}`;
        }
        finalUrl = `${mediaBase}${normalizedPath}`.replace(/([^:]\/)\/+/g, "$1");
    }

    // Apply Cloudinary transformations if applicable
    if (finalUrl.includes('cloudinary.com') && Object.keys(options).length > 0) {
        try {
            const parts = finalUrl.split('/upload/');
            if (parts.length === 2) {
                const transformationParams = [];
                if (options.width) transformationParams.push(`w_${options.width}`);
                if (options.height) transformationParams.push(`h_${options.height}`);
                if (options.quality) transformationParams.push(`q_${options.quality}`);
                if (options.crop) transformationParams.push(`c_${options.crop}`);
                if (options.format) transformationParams.push(`f_${options.format}`);
                else transformationParams.push('f_auto');

                return `${parts[0]}/upload/${transformationParams.join(',')}/${parts[1]}`;
            }
        } catch (err) {
            console.error("Cloudinary transformation failed:", err);
        }
    }

    return finalUrl;
};
