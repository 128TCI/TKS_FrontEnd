import { useState } from 'react';
import { Database, Check, AlertCircle } from 'lucide-react';
import { Footer } from './Footer/Footer';

export function CreateNewDatabasePage() {
  const [serverName, setServerName] = useState('128PC-85\\SQL2022');
  const [databaseName, setDatabaseName] = useState('');
  const [useServerAuth, setUseServerAuth] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [activeTab, setActiveTab] = useState<'results' | 'scripts'>('results');
  const [resultsText, setResultsText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreate = () => {
    if (!databaseName || !companyCode || !companyName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setActiveTab('results');
    setResultsText('Creating database...\nInitializing tables...\nSetting up company information...\nDatabase created successfully!');
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Create New Database</h1>
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
                    Create a new database for a company with all required tables, stored procedures, and initial configurations. This process will set up the complete timekeeping system structure.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Initialize database schema and tables</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Set up stored procedures and functions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure company information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">SQL Server Authentication support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Section - Database Configuration */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h3 className="text-gray-900 mb-4">Database Configuration</h3>

                <div className="space-y-4">
                  {/* Server Name */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Server Name</label>
                    <select
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="128PC-85\SQL2022">128PC-85\SQL2022</option>
                      <option value="localhost">localhost</option>
                      <option value=".\SQLEXPRESS">.\SQLEXPRESS</option>
                    </select>
                  </div>

                  {/* Database Name */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Database Name</label>
                    <input
                      type="text"
                      value={databaseName}
                      onChange={(e) => setDatabaseName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter database name"
                    />
                  </div>

                  {/* Authentication Section */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h4 className="text-gray-700 text-sm mb-3">Authentication</h4>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={useServerAuth}
                          onChange={() => setUseServerAuth(true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Use SQL Server Authentication</span>
                      </label>

                      {useServerAuth && (
                        <div className="ml-6 space-y-3">
                          <div>
                            <label className="block text-gray-600 text-sm mb-1">Username</label>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter username"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 text-sm mb-1">Password</label>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter password"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Details Section */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h4 className="text-gray-700 text-sm mb-3">Company Details</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Code</label>
                        <input
                          type="text"
                          value={companyCode}
                          onChange={(e) => setCompanyCode(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter company code"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-center pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCreate}
                      disabled={isProcessing}
                      className="px-8 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Database className="w-4 h-4" />
                      {isProcessing ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section - Output */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 text-sm transition-colors ${
                      activeTab === 'results'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Results
                  </button>
                  <button
                    onClick={() => setActiveTab('scripts')}
                    className={`px-4 py-2 text-sm transition-colors ${
                      activeTab === 'scripts'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Scripts
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 h-[500px] overflow-auto">
                  {activeTab === 'results' && (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {resultsText || 'No results yet. Click "Create" to initialize the database.'}
                    </div>
                  )}
                  {activeTab === 'scripts' && (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {`-- Database Creation Script
CREATE DATABASE [${databaseName || 'DatabaseName'}]
GO

USE [${databaseName || 'DatabaseName'}]
GO

-- Create Company Table
CREATE TABLE Company (
  CompanyCode VARCHAR(10) PRIMARY KEY,
  CompanyName VARCHAR(100) NOT NULL
)
GO

-- Create Employee Table
CREATE TABLE Employee (
  EmployeeID INT PRIMARY KEY IDENTITY(1,1),
  EmployeeCode VARCHAR(20) NOT NULL,
  FirstName VARCHAR(50),
  LastName VARCHAR(50),
  CompanyCode VARCHAR(10)
)
GO`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}