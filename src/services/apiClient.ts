// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  //  baseURL: 'https://demo.128techconsultinginc.com/DEMO_128_TKS/api',
  baseURL: 'https://localhost:7264/api',
});

export default apiClient;