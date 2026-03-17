import { useState, useEffect, useRef } from 'react';
import { SystemInfo } from '../Types/system';
import { systemService } from '../../services/systemService';

export function Footer() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [copied, setCopied]         = useState(false);
  const fetchedRef                  = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    systemService
      .getSystemInfo()
      .then(data => setSystemInfo(data))
      .catch(() => setSystemInfo(null));
  }, []);

  const handleCopyBuildDate = async () => {
    if (!systemInfo) return;
    // Format: "March 17, 2026 | 01:58:59 PM"
    const text = systemInfo.buildDate;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-600 border-t border-green-700">
      <div className="flex items-center justify-center h-8 px-4 relative">
        <p className="text-white text-xs text-center">
          © {currentYear} 128 Tech Consulting Inc. All rights reserved.
          {systemInfo && (
            <>
              {' '}|{' '}
              <button
                onClick={handleCopyBuildDate}
                title="Click to copy build date"
                className="underline underline-offset-2 decoration-dotted hover:text-green-200 transition-colors duration-150 cursor-pointer"
              >
                <u>{systemInfo.appVersion}</u>
              </button>
            </>
          )}
        </p>

        {/* Copied toast — appears briefly to the right */}
        {copied && (
          <span className="absolute right-40 text-blue-200 text-xs animate-fadeIn">
          </span>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn  { animation: fadeIn 0.15s ease-out; }
      `}</style>
    </footer>
  );
}
