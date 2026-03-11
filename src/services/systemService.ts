import apiClient from './apiClient';
import type { SystemInfo } from '../components/Types/system';

const BASE = '/SystemInfo';

export const systemService = {

  async getSystemInfo(): Promise<SystemInfo> {
    const res = await apiClient.get(`${BASE}/version`);
    console.log('API response:', res.data);
    return res.data;

  },

};