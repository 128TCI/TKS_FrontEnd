// src/services/auditTrailService.ts
import apiClient from './apiClient';

interface AuditTrailPayload {
  accessType: string;
  trans: string;
  messages: string;
  formName?: string; // optional, default if not provided
}

const AuditTrailService = {
  log: async ({ accessType, trans, messages, formName }: AuditTrailPayload) => {
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');

      await apiClient.put('/AuditTrail/AddAuditTrail', {
        userId: (user?.userID ?? 'UnknownUser').toString(),
        formName: formName ?? 'Form Name not found', // default formName
        accessType: accessType || 'Unknown',
        trans: trans || 'No transaction',
        messages: messages || 'No message',
        machine: (user?.machineName || 'Machine Name not found').toString(),
      });
    } catch (error) {
      console.error('Failed to log audit trail:', error);
    }
  },
};

export default AuditTrailService;
