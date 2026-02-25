import { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { Footer } from '../Footer/Footer';

export function UpdateRawdataOnlinePage() {
  const [option, setOption] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Rawdata Online</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Update raw data online for processing and synchronization.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">ℹ</div>
                      <span className="text-gray-600">Configure options before updating</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">ℹ</div>
                      <span className="text-gray-600">Process will run immediately</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Option Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-gray-700 mb-4">Option</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 w-24">Option:</label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                    className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter option value"
                  />
                </div>

                <div className="flex justify-start pt-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}