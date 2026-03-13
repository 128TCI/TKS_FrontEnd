import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export function Footer() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [buildYear,  setBuildYear]  = useState<string>('');

  useEffect(() => {
    apiClient.get('/SystemInfo/version')
      .then(res => {
        setAppVersion(res.data?.appVersion ?? '');
        // Extract year from buildDate (e.g. "2026-03-01" or "03/01/2026")
        const raw = res.data?.buildDate ?? '';
        const match = raw.match(/\b(20\d{2})\b/);
        setBuildYear(match ? match[1] : new Date().getFullYear().toString());
      })
      .catch(() => {
        setBuildYear(new Date().getFullYear().toString());
      });
  }, []);

  return (
    <div className="w-full bg-green-600 text-white py-3">
      <div className="text-center">
        <p className="text-white text-sm">
          © {buildYear} 128 Tech Consulting Inc. All rights reserved.{appVersion ? ` | ${appVersion}` : ''}
        </p>
      </div>
    </div>
  );
}
