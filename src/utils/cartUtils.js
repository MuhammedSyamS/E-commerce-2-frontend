/**
 * Robustly compares two variant objects (size, color, etc.)
 */
export const isSameVariant = (v1, v2) => {
  if (!v1 && !v2) return true;
  if (!v1 || !v2) return false;
  
  const normalize = (val) => String(val || '').trim().toLowerCase();
  
  return normalize(v1.size) === normalize(v2.size) && 
         normalize(v1.color) === normalize(v2.color);
};

/**
 * Extracts a stable ID from a cart item, handling various nesting patterns
 */
export const getItemId = (item) => {
  if (!item) return '';
  const rawId = item.product?._id || item.product || item._id || '';
  return rawId.toString();
};
