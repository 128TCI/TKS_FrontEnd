// src/services/auditTrailService.ts
import apiClient from './apiClient';
import { decryptData } from '../services/encryptionService'; // adjust path as needed

interface AuditTrailPayload {
  accessType: string;
  trans: string;
  messages: string;
  formName?: string;
}

const AuditTrailService = {
  log: async ({ accessType, trans, messages, formName }: AuditTrailPayload) => {
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');

      const rawUserId = user?.userID;

      let userId: string;

      if (typeof rawUserId === "string") {
          const decrypted = decryptData(rawUserId);
          userId = decrypted || rawUserId;
      } else {
          userId = rawUserId?.toString?.() || "UnknownUser";
      }
      const machineName = decryptData(user?.machineName) || user?.machineName || 'Machine Name not found';

      await apiClient.put('/AuditTrail/AddAuditTrail', {
        userId:     userId.toString(),
        formName:   formName ?? 'Form Name not found',
        accessType: accessType || 'Unknown',
        trans:      trans      || 'No transaction',
        messages:   messages   || 'No message',
        machine:    machineName.toString(),
      });
    } catch (error) {
      console.error('Failed to log audit trail:', error);
    }
  },
};

export default AuditTrailService;