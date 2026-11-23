const baseURL = process.env.EXPO_PUBLIC_API_URL || '';

export const apiConfig = {
  baseURL,
  timeout: 10000,
  useMock: baseURL.length === 0,
};
