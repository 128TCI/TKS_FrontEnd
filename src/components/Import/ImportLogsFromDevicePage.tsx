import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, XCircle, Upload, Download, Calendar, Database } from 'lucide-react';
import { Footer } from './Footer/Footer';

export function ImportLogsFromDevicePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Add cancel/reset logic here
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    // Add import logic here
    console.log('Importing file:', selectedFile);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Import Logs from Device v2</h1>
            <p className="text-white opacity-90 text-sm mt-1">Import attendance logs from biometric devices</p>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <button 
                onClick={isEditing ? handleSave : handleEdit}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm ${
                  isEditing 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </>
                )}
              </button>
              {isEditing && (
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>

            {/* Import Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
              <h3 className="text-gray-900 mb-6">Import Settings</h3>
              
              <div className="space-y-5">
                {/* Device Selection */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Select Device <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option>All Devices</option>
                    <option>Device 1 - Main Entrance</option>
                    <option>Device 2 - Office Floor</option>
                    <option>Device 3 - Factory</option>
                    <option>Device 4 - Warehouse</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Select Log File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".txt,.dat,.log"
                      onChange={handleFileChange}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      disabled={!isEditing}
                    >
                      <Upload className="w-4 h-4" />
                      Browse
                    </button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Date From</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        disabled={!isEditing}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Date To</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        disabled={!isEditing}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="deleteExisting"
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="deleteExisting" className="text-gray-700">
                      Delete existing data before import
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="validateData"
                      disabled={!isEditing}
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="validateData" className="text-gray-700">
                      Validate employee IDs before import
                    </label>
                  </div>
                </div>

                {/* Import Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleImport}
                    disabled={!selectedFile || !isEditing}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Database className="w-4 h-4" />
                    Import Logs
                  </button>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> Supported file formats: .txt, .dat, .log. 
                The system will automatically detect the device format and parse the logs accordingly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}