/**
 * URL Helper Utility
 * Centralizes URL generation logic to ensure consistent production URLs
 */

/**
 * Get the base URL for the application
 * @returns {string} The base URL (production or localhost)
 */
function getBaseUrl() {
  // If BASE_URL is explicitly set, use it
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // If in production environment, use production URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://cateredsavers.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:3000';
}

/**
 * Generate a personalized deals URL for a user
 * @param {string} accessToken - User's access token
 * @returns {string} Personalized deals URL
 */
function getPersonalizedDealsUrl(accessToken) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/deals/${accessToken}`;
}

/**
 * Generate a pending deals URL for users without access tokens
 * @returns {string} Pending deals URL
 */
function getPendingDealsUrl() {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/deals/pending`;
}

/**
 * Get debug information about URL configuration
 * @returns {object} Debug information
 */
function getUrlDebugInfo() {
  return {
    BASE_URL: process.env.BASE_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    computedBaseUrl: getBaseUrl(),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getBaseUrl,
  getPersonalizedDealsUrl,
  getPendingDealsUrl,
  getUrlDebugInfo
};
