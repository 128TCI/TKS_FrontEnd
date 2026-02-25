import { useState } from 'react';
import { 
  Search, 
  Save, 
  X, 
  Calendar,
  Building2,
  Users,
  CheckSquare
} from 'lucide-react';
import { DatePicker } from './DateSetup/DatePicker';

export function TKSGroupSetupDefinitionPage() {
  const [tksGroupCode, setTksGroupCode] = useState('1');
  const [tksGroupDescription, setTksGroupDescription] = useState('MANAGER');
  const [payrollLocationCode, setPayrollLocationCode] = useState('1');
  const [payrollDescription, setPayrollDescription] = useState('MANAGER');
  const [dateFrom, setDateFrom] = useState('03/01/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [month, setMonth] = useState('March');
  const [period, setPeriod] = useState('');
  const [terminalId, setTerminalId] = useState('');

  const groupList = [
    { code: '2', description: 'ASSISTANT MANAGER', appliesAll: false },
    { code: '3', description: 'RANK AND FILE', appliesAll: false }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">TKS Group Setup Definition</h1>
        <p className="text-gray-600">Manage timekeeping group definitions and configurations</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="space-y-8">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>

            {/* Group Information Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-gray-900">Group Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TKS Group Code */}
                <div>
                  <label className="block text-gray-700 mb-2">TKS Group Code</label>
                  <input
                    type="text"
                    value={tksGroupCode}
                    onChange={(e) => setTksGroupCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter group code"
                  />
                </div>

                {/* TKS Group Description */}
                <div>
                  <label className="block text-gray-700 mb-2">TKS Group Description</label>
                  <input
                    type="text"
                    value={tksGroupDescription}
                    onChange={(e) => setTksGroupDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter group description"
                  />
                </div>

                {/* Payroll Location Code */}
                <div>
                  <label className="block text-gray-700 mb-2">Payroll Location Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={payrollLocationCode}
                      onChange={(e) => setPayrollLocationCode(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Code"
                    />
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </div>
                </div>

                {/* Payroll Description */}
                <div>
                  <label className="block text-gray-700 mb-2">Payroll Description</label>
                  <input
                    type="text"
                    value={payrollDescription}
                    onChange={(e) => setPayrollDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter payroll description"
                  />
                </div>
              </div>
            </div>

            {/* Cut-Off Dates Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="text-gray-900">Time Keep Cut-Off Dates</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Date From */}
                <div>
                  <label className="block text-gray-700 mb-2">From</label>
                  <DatePicker
                    value={dateFrom}
                    onChange={(date) => setDateFrom(date)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-gray-700 mb-2">To</label>
                  <DatePicker
                    value={dateTo}
                    onChange={(date) => setDateTo(date)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                {/* Month */}
                <div>
                  <label className="block text-gray-700 mb-2">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-gray-700 mb-2">Period</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter period"
                  />
                </div>

                {/* Terminal ID */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-gray-700 mb-2">Terminal ID</label>
                  <input
                    type="text"
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter terminal ID"
                  />
                </div>
              </div>
            </div>

            {/* Group List Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="text-gray-900">Group List</h3>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-white">TKS Group Code</th>
                      <th className="px-6 py-4 text-left text-white">Description</th>
                      <th className="px-6 py-4 text-center text-white">
                        <div className="flex items-center justify-center gap-2">
                          <CheckSquare className="w-4 h-4" />
                          Applies to All
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupList.map((group, index) => (
                      <tr 
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-900">{group.code}</td>
                        <td className="px-6 py-4 text-gray-700">{group.description}</td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={group.appliesAll}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            readOnly
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
