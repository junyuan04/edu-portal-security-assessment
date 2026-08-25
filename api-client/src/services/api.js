import axios from 'axios';

const BASE_URL = import.meta.env.VITE_REST_API_BASE_URL || '/rest';

// Build a one-off axios instance for each request, injecting the token.
const buildClient = (token) =>
  axios.create({
    baseURL: BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // Return full response 
    validateStatus: () => true,
  });

export default buildClient;


