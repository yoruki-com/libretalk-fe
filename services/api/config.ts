// API Configuration
// Set EXPO_PUBLIC_API_BASE_URL in .env file
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const API_VERSION = "v1";

export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

export const DEFAULT_PAGE_SIZE = 20;
