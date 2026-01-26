import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';

export function UnitSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);
  
  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headCode, setHeadCode] = useState('');
  const [head, setHead] = useState('');
  const [deviceName, setDeviceName] = useState('');
  
  // Modal state
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [headSearchTerm, setHeadSearchTerm] = useState('');
  const [showDeviceNameModal, setShowDeviceNameModal] = useState(false);
  const [deviceNameSearchTerm, setDeviceNameSearchTerm] = useState('');
  
  // Sample data for the list
  const [unitList, setUnitList] = useState([
    { code: '-', description: '-', head: '', deviceName: '' },
    { code: 'UNIT 1', description: 'UNIT1', head: '', deviceName: '' },
  ]);

  // Sample employee data for Head modal
  const employeeData = [
    { empCode: '000877', name: 'Last122, First A', groupCode: '45' },
    { empCode: '000878', name: 'Last, First A', groupCode: '45' },
    { empCode: '000900', name: 'Last, First A', groupCode: '109' },
    { empCode: '000901', name: 'Last, First A', groupCode: '109' },
    { empCode: '000902', name: 'Last, First III A', groupCode: '45' },
    { empCode: '000903', name: 'Last, First A', groupCode: '45' },
    { empCode: '000904', name: 'Last, First A', groupCode: '45' },
    { empCode: '000905', name: 'Last, First A', groupCode: '45' },
    { empCode: '000906', name: 'Last, First A', groupCode: '45' },
    { empCode: '000907', name: 'Last, First A', groupCode: '45' },
  ];

  // Sample device data for Device Name modal (empty as per requirements)
  const deviceData: { code: string; description: string }[] = [];

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showHeadModal) {
          setShowHeadModal(false);
        } else if (showDeviceNameModal) {
          setShowDeviceNameModal(false);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        }
      }
    };

    if (showCreateModal || showHeadModal || showDeviceNameModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showHeadModal, showDeviceNameModal, showCreateModal]);

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedUnitIndex(null);
    // Clear form
    setCode('');
    setDescription('');
    setHeadCode('');
    setHead('');
    setDeviceName('');
    setShowCreateModal(true);
  };

  const handleEdit = (unit: any, index: number) => {
    setIsEditMode(true);
    setSelectedUnitIndex(index);
    setCode(unit.code);
    setDescription(unit.description);
    setHeadCode('');
    setHead(unit.head);
    setDeviceName(unit.deviceName);
    setShowCreateModal(true);
  };

  const handleDelete = (unitCode: string) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      setUnitList(unitList.filter(unit => unit.code !== unitCode));
    }
  };

  const handleSubmit = () => {
    // Validate code
    if (!code.trim()) {
      alert('Please enter a Code.');
      return;
    }

    if (isEditMode && selectedUnitIndex !== null) {
      // Update existing record
      const updatedList = [...unitList];
      updatedList[selectedUnitIndex] = {
        code: code,
        description: description,
        head: head,
        deviceName: deviceName
      };
      setUnitList(updatedList);
    } else {
      // Create new record
      const newUnit = {
        code: code,
        description: description,
        head: head,
        deviceName: deviceName
      };
      setUnitList([...unitList, newUnit]);
    }

    // Close modal and reset form
    setShowCreateModal(false);
    setCode('');
    setDescription('');
    setHeadCode('');
    setHead('');
    setDeviceName('');
    setIsEditMode(false);
    setSelectedUnitIndex(null);
  };

  const handleHeadSelect = (empCode: string, name: string) => {
    setHeadCode(empCode);
    setHead(name);
    setShowHeadModal(false);
  };

  const handleDeviceNameSelect = (deviceCode: string, deviceDesc: string) => {
    setDeviceName(deviceDesc);
    setShowDeviceNameModal(false);
  };

  const filteredUnits = unitList.filter(unit =>
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.deviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employeeData.filter(emp =>
    emp.empCode.toLowerCase().includes(headSearchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(headSearchTerm.toLowerCase()) ||
    emp.groupCode.toLowerCase().includes(headSearchTerm.toLowerCase())
  );

  const filteredDevices = deviceData.filter(device =>
    device.code.toLowerCase().includes(deviceNameSearchTerm.toLowerCase()) ||
    device.description.toLowerCase().includes(deviceNameSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Unit Setup</h1>
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
                    Configure organizational units with designated heads and device configurations for streamlined unit management and employee grouping within departments and divisions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Unit code and description management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Unit head assignment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Device name configuration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Work unit organization tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                    <th className="px-4 py-2 text-left text-gray-700">Device Name</th>
                    <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{unit.code}</td>
                      <td className="px-4 py-2">{unit.description}</td>
                      <td className="px-4 py-2">{unit.head}</td>
                      <td className="px-4 py-2">{unit.deviceName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(unit, index)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit"
                            >
                            <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => handleDelete(unit.code)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                Showing 1 to {filteredUnits.length} of {filteredUnits.length} entries
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
            <>
            {/* Modal Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 z-10"
                onClick={() => setShowCreateModal(false)}
            ></div>

            {/* Modal Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800">{isEditMode ? 'Edit' : 'Create New'}</h2>
                      <button 
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Unit Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Code :</label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Description :</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Head Code :</label>
                          <input
                            type="text"
                            value={headCode}
                            onChange={(e) => setHeadCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowHeadModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setHeadCode('');
                              setHead('');
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Head :</label>
                          <input
                            type="text"
                            value={head}
                            readOnly
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Device Name :</label>
                          <input
                            type="text"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowDeviceNameModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeviceName('')}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleSubmit}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          {isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button
                          onClick={() => setShowCreateModal(false)}
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          Back to List
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Head Search Modal (Employee Code) */}
            {showHeadModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-30"
                  onClick={() => setShowHeadModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800 text-sm">Search</h2>
                      <button 
                        onClick={() => setShowHeadModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-3">
                      <h3 className="text-blue-600 mb-2 text-sm">Employee Code</h3>

                      {/* Search Input */}
                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-gray-700 text-sm">Search:</label>
                        <input
                          type="text"
                          value={headSearchTerm}
                          onChange={(e) => setHeadSearchTerm(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Employee Table */}
                      <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="w-full border-collapse text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode ▲</th>
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Name</th>
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Group Code</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEmployees.map((emp, index) => (
                              <tr 
                                key={emp.empCode}
                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                onClick={() => handleHeadSelect(emp.empCode, emp.name)}
                              >
                                <td className="px-3 py-1.5">{emp.empCode}</td>
                                <td className="px-3 py-1.5">{emp.name}</td>
                                <td className="px-3 py-1.5">{emp.groupCode}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-gray-600 text-xs">
                          Showing 1 to 10 of 1,658 entries
                        </div>
                        <div className="flex gap-1">
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                            Previous
                          </button>
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">2</button>
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">3</button>
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">4</button>
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">5</button>
                          <span className="px-1 text-gray-500 text-xs">...</span>
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">166</button>
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Device Name Search Modal */}
            {showDeviceNameModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-30"
                  onClick={() => setShowDeviceNameModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800 text-sm">Search</h2>
                      <button 
                        onClick={() => setShowDeviceNameModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-3">
                      <h3 className="text-blue-600 mb-2 text-sm">Borrowed Device Name</h3>

                      {/* Search Input */}
                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-gray-700 text-sm">Search:</label>
                        <input
                          type="text"
                          value={deviceNameSearchTerm}
                          onChange={(e) => setDeviceNameSearchTerm(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Device Table */}
                      <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="w-full border-collapse text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDevices.length > 0 ? (
                              filteredDevices.map((device, index) => (
                                <tr 
                                  key={device.code}
                                  className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                  onClick={() => handleDeviceNameSelect(device.code, device.description)}
                                >
                                  <td className="px-3 py-1.5">{device.code}</td>
                                  <td className="px-3 py-1.5">{device.description}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className="px-3 py-8 text-center text-gray-500 text-sm">
                                  No data available in table
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-gray-600 text-xs">
                          Showing 0 to 0 of 0 entries
                        </div>
                        <div className="flex gap-1">
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                            Previous
                          </button>
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}