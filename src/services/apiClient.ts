// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({ 
  baseURL: 'https://localhost:7264/api',
});

export default apiClient;