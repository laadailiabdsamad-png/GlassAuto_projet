import axios from 'axios';
import { apiConfig } from './config';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

apiClient.interceptors.request.use((request) => {
  if (authToken) {
    request.headers.Authorization = `Bearer ${authToken}`;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response && error.response.data && error.response.data.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : error.response
          ? 'Le serveur n’a pas pu traiter la demande. Réessayez dans un instant.'
          : 'Connexion au serveur impossible. Vérifiez votre réseau.';
    return Promise.reject(new Error(message));
  }
);
