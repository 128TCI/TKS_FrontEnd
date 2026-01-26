import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Check } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface DeviceType {
  id: number;
  deviceName: string;
  isChecked: boolean;
}

export function DeviceTypeSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [devices, setDevices] = useState<DeviceType[]>([
    { id: 1, deviceName: 'B3TFT (TEXT FILE)', isChecked: false },
    { id: 2, deviceName: 'B3-TFT-U', isChecked: false },
    { id: 3, deviceName: 'B3-TFT-U_DATFILE', isChecked: true },
    { id: 4, deviceName: 'DPA', isChecked: false },
    { id: 5, deviceName: 'ELID Device (Text File)', isChecked: false },
    { id: 6, deviceName: 'Excel Format', isChecked: true },
    { id: 7, deviceName: 'FILMINERA DEVICE', isChecked: false },
    { id: 8, deviceName: 'FLEXIBLE_IMPORT_UTILITY', isChecked: true },
    { id: 9, deviceName: 'FPMS', isChecked: false },
    { id: 10, deviceName: 'GUSI DEVICE', isChecked: false },
    { id: 11, deviceName: 'IClock (Dat File)', isChecked: false },
    { id: 12, deviceName: 'Iface', isChecked: false },
    { id: 13, deviceName: 'IFACE WITH NO FLAG', isChecked: false },
    { id: 14, deviceName: 'IN01-A', isChecked: false },
    { id: 15, deviceName: 'IN01A WITH BREAK', isChecked: false },
    { id: 16, deviceName: 'ISS DTR', isChecked: false },
    { id: 17, deviceName: 'MAFIINC', isChecked: false },
    { id: 18, deviceName: 'MDD DEVICE', isChecked: false },
    { id: 19, deviceName: 'ONESIMUS_DEVICE', isChecked: false },
    { id: 20, deviceName: 'P4P DEVICE', isChecked: false },
    { id: 21, deviceName: 'PORTABLE BIOMETRICS_LDI', isChecked: false },
    { id: 22, deviceName: 'POSC_DEVICE', isChecked: false },
    { id: 23, deviceName: 'PROSYNC_DEVICE', isChecked: false },
    { id: 24, deviceName: 'RCS_DEVICE', isChecked: true },
    { id: 25, deviceName: 'SUPREMA', isChecked: false },
    { id: 26, deviceName: 'TITANIUM_PORTABLE_TRS', isChecked: true },
    { id: 27, deviceName: 'USB Digital Persona (U.ARE.U 4000B Reader)', isChecked: false },
    { id: 28, deviceName: 'VIRDI (TEXT FILE)', isChecked: false },
    { id: 29, deviceName: 'ZK TECO EXCEL', isChecked: false },
    { id: 30, deviceName: 'ZK TIME', isChecked: false }
  ]);

  const itemsPerPage = 25;
  
  const filteredData = devices.filter(item =>
    item.deviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.deviceName.localeCompare(b.deviceName);
    } else {
      return b.deviceName.localeCompare(a.deviceName);
    }
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleDevice = (id: number) => {
    setDevices(prev =>
      prev.map(device =>
        device.id === id ? { ...device, isChecked: !device.isChecked } : device
      )
    );
  };

  const handleToggleAll = () => {
    const allChecked = paginatedData.every(device => device.isChecked);
    const idsToToggle = paginatedData.map(d => d.id);
    
    setDevices(prev =>
      prev.map(device =>
        idsToToggle.includes(device.id) ? { ...device, isChecked: !allChecked } : device
      )
    );
  };

  const handleSortToggle = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const allPageItemsChecked = paginatedData.length > 0 && paginatedData.every(device => device.isChecked);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Device Type Setup</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Manage biometric device types and models used throughout your organization. Configure device classifications for proper integration with different hardware manufacturers and attendance capture systems.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Multi-vendor support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Device classification</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Hardware compatibility</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Centralized configuration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={allPageItemsChecked}
                        onChange={handleToggleAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs text-gray-600 uppercase cursor-pointer hover:text-gray-900 select-none"
                      onClick={handleSortToggle}
                    >
                      <div className="flex items-center gap-2">
                        DeviceName
                        <span className="text-gray-400">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((device) => (
                      <tr 
                        key={device.id} 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          device.isChecked ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleToggleDevice(device.id)}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={device.isChecked}
                            onChange={() => handleToggleDevice(device.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td 
                          className={`px-6 py-4 text-sm ${
                            device.isChecked ? 'text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          {device.deviceName}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-16 text-center">
                        <div className="text-gray-500">No data available in table</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {sortedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded ${
                      currentPage === page ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                  disabled={currentPage >= totalPages || sortedData.length === 0}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}