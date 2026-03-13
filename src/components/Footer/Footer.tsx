import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export function Footer() {
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    apiClient.get('/SystemInfo/version')
      .then(res => setAppVersion(res.data?.appVersion ?? ''))
      .catch(() => {});
  }, []);

  return (
    <div className="w-full bg-green-600 text-white py-3">
      <div className="text-center">
        <p className="text-white text-sm">
          © 2026 128 Tech Consulting Inc. All rights reserved.{appVersion ? ` | ${appVersion}` : ''}
        </p>
      </div>
    </div>
  );
}
