// Utility function to convert relative image URLs to absolute URLs
export const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  
  // If it's already an absolute URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // If it starts with /uploads, prepend the backend URL
  if (relativePath.startsWith('/uploads')) {
    return `http://localhost:3001${relativePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  return `http://localhost:3001${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};
export const getImageUrl2 = (relativePath) => {
  if (!relativePath) return '';
  
  // If it's already an absolute URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // If it starts with /uploads, prepend the backend URL
  if (relativePath.startsWith('/uploads')) {
    return `http://localhost:8000${relativePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  return `http://localhost:8000${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};
