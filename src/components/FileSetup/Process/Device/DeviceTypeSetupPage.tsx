import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import Swal from 'sweetalert2';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';
import { decryptData } from '../../../../services/encryptionService';

const formName = 'Device Type SetUp';
interface DeviceType {
  id: number; // Temporary ID for React keys (based on index)
  deviceName: string;
  isChecked: boolean;
  deviceType2Id?: number | null; // Actual DeviceType2 ID from database when checked
}

interface DeviceType2 {
  id: number;
  deviceName: string;
}

const API_DEVICE_TYPES = '/Fs/Process/Device/DeviceTypeSetUp';
const API_ACTIVE_DEVICES = '/Fs/Process/Device/DeviceTypeSetUp/DeviceType2';

export function DeviceTypeSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingActiveDevices, setLoadingActiveDevices] = useState(false);
  const [deviceError, setDeviceError] = useState('');
  const [processingToggle, setProcessingToggle] = useState<number | null>(null);

  const itemsPerPage = 25;

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getDeviceTypePermissions();
    }, []);
  
    const getDeviceTypePermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "DeviceTypeSetUp"
        );
  
        // Build a map: { Add: true, Edit: true, ... }
        const permMap: Record<string, boolean> = {};
        branchEntries.forEach((p) => {
          const accessType = decryptData(p.accessTypeName);
          if (accessType) permMap[accessType] = true;
        });
  
        setPermissions(permMap);
  
      } catch (e) {
        console.error("Error parsing or decrypting payload", e);
      }
    };

  // Fetch all device types
  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    setLoadingDevices(true);
    setDeviceError('');
    try {
      const response = await apiClient.get(API_DEVICE_TYPES);
      if (response.status === 200 && response.data) {
        // API returns array of { deviceName } without id
        // We'll create a unique ID based on index for React keys
        const deviceList = response.data.map((device: any, index: number) => ({
          id: index + 1, // Use index as temporary ID for UI purposes
          deviceName: device.deviceName,
          isChecked: false,
          deviceType2Id: null
        }));
        console.log('Fetched device types:', deviceList);
        setDevices(deviceList);
        // After loading devices, fetch active devices
        await fetchActiveDevices(deviceList);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load device types';
      setDeviceError(errorMsg);
      console.error('Error fetching device types:', error);
    } finally {
      setLoadingDevices(false);
    }
  };

  const fetchActiveDevices = async (deviceList?: DeviceType[]) => {
    setLoadingActiveDevices(true);
    try {
      const response = await apiClient.get(API_ACTIVE_DEVICES);
      if (response.status === 200 && response.data) {
        // Create a map of deviceName to DeviceType2 ID
        const activeDevicesMap = new Map<string, number>();
        response.data.forEach((d: DeviceType2) => {
          activeDevicesMap.set(d.deviceName, d.id);
        });
        
        console.log('Active devices map:', Object.fromEntries(activeDevicesMap));
        
        // Use provided deviceList or current state
        const currentDevices = deviceList || devices;
        
        // Update isChecked and store DeviceType2 ID based on active devices
        const updatedDevices = currentDevices.map(device => ({
          ...device,
          isChecked: activeDevicesMap.has(device.deviceName),
          deviceType2Id: activeDevicesMap.get(device.deviceName) || null
        }));
        
        console.log('Updated devices with active status');
        setDevices(updatedDevices);
      }
    } catch (error: any) {
      console.error('Error fetching active devices:', error);
      // Don't show error message for active devices, just log it
    } finally {
      setLoadingActiveDevices(false);
    }
  };

  const handleToggleDevice = async (deviceId: number, deviceName: string) => {
    console.log('handleToggleDevice called with:', { deviceId, deviceName });
    
    if (processingToggle !== null) {
      console.log('Already processing, skipping...');
      return;
    }

    // Find the device by deviceName (not id, since id is just for UI)
    const deviceIndex = devices.findIndex(d => d.deviceName === deviceName);
    if (deviceIndex === -1) {
      console.error('Device not found with deviceName:', deviceName);
      return;
    }

    const device = devices[deviceIndex];
    
    console.log('Found device at index', deviceIndex, ':', { 
      id: device.id, 
      deviceName: device.deviceName, 
      isChecked: device.isChecked, 
      deviceType2Id: device.deviceType2Id 
    });

    setProcessingToggle(deviceId);

    try {
      if (device.isChecked && device.deviceType2Id) {
        // Uncheck - DELETE from DeviceType2 using stored ID
        console.log('Deleting active device:', {
          deviceType2Id: device.deviceType2Id,
          deviceName: device.deviceName
        });
        const deleteUrl = `${API_ACTIVE_DEVICES}/${device.deviceType2Id}`;
        console.log('DELETE URL:', deleteUrl);
        await apiClient.delete(deleteUrl);
        await auditTrail.log({
          accessType: 'Delete',
          trans: `Device ${device.deviceName} removed from active devices`,
          messages: `Device ID: ${device.deviceType2Id}`,
          formName
        });
        // Update local state immediately using deviceName to find
        setDevices(prev => {
          const idx = prev.findIndex(d => d.deviceName === deviceName);
          if (idx === -1) return prev;
          
          const newDevices = [...prev];
          newDevices[idx] = { 
            ...newDevices[idx], 
            isChecked: false, 
            deviceType2Id: null 
          };
          console.log('Updated device to unchecked:', newDevices[idx]);
          return newDevices;
        });
      } else {
        // Check - POST to DeviceType2
        const payload = {
          id: 0,
          deviceName: device.deviceName
        };

        console.log('POST payload:', payload);
        const response = await apiClient.post(API_ACTIVE_DEVICES, payload);
        console.log('POST response:', response.data);
        
        // Get the new ID from response if available
        const newDeviceType2Id = response.data?.id || null;
        console.log('New DeviceType2 ID:', newDeviceType2Id);
        await auditTrail.log({
          accessType: 'Add',
          trans: `Device ${device.deviceName} added to active devices`,
          messages: `DeviceType2 ID: ${newDeviceType2Id}`,
          formName
        });
        
        // Update local state immediately using deviceName to find
        setDevices(prev => {
          const idx = prev.findIndex(d => d.deviceName === deviceName);
          if (idx === -1) return prev;
          
          const newDevices = [...prev];
          newDevices[idx] = { 
            ...newDevices[idx], 
            isChecked: true, 
            deviceType2Id: newDeviceType2Id 
          };
          console.log('Updated device to checked:', newDevices[idx]);
          return newDevices;
        });
        
        // Always refresh to ensure IDs are synced correctly
        await fetchActiveDevices();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update device';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error toggling device:', error);
      // Refresh to sync state on error
      await fetchActiveDevices();
    } finally {
      setProcessingToggle(null);
    }
  };

  const handleToggleAll = async () => {
    if (processingToggle !== null) return;

    const allChecked = paginatedData.every(device => device.isChecked);
    const devicesToToggle = paginatedData;

    setProcessingToggle(-1); // Use -1 to indicate bulk operation

    try {
      if (allChecked) {
        // Uncheck all - DELETE all from DeviceType2 one by one
        for (const device of devicesToToggle) {
          if (device.deviceType2Id) {
            console.log('Deleting active device with ID:', device.deviceType2Id);
            try {
              await apiClient.delete(`${API_ACTIVE_DEVICES}/${device.deviceType2Id}`);
              await auditTrail.log({
                accessType: 'Delete',
                trans: `Device ${device.deviceName} removed from active devices (bulk)`,
                messages: `DeviceType2 ID: ${device.deviceType2Id}`,
                formName
              });
              
              // Update local state after each successful delete using deviceName to find
              setDevices(prev => {
                const deviceIndex = prev.findIndex(d => d.deviceName === device.deviceName);
                if (deviceIndex === -1) return prev;
                
                const newDevices = [...prev];
                newDevices[deviceIndex] = { 
                  ...newDevices[deviceIndex], 
                  isChecked: false, 
                  deviceType2Id: null 
                };
                return newDevices;
              });
            } catch (error) {
              console.error(`Failed to delete device ${device.deviceName}:`, error);
              // Continue with next device even if one fails
            }
          }
        }
      } else {
        // Check all - POST all to DeviceType2 one by one
        for (const device of devicesToToggle) {
          if (!device.isChecked) {
            try {
              const payload = {
                id: 0,
                deviceName: device.deviceName
              };
              const response = await apiClient.post(API_ACTIVE_DEVICES, payload);
              
              // Get the new ID from response if available
              const newDeviceType2Id = response.data?.id || null;
              await auditTrail.log({
                accessType: 'Add',
                trans: `Device ${device.deviceName} added to active devices (bulk)`,
                messages: `DeviceType2 ID: ${newDeviceType2Id}`,
                formName
              });
              
              // Update local state after each successful post using deviceName to find
              setDevices(prev => {
                const deviceIndex = prev.findIndex(d => d.deviceName === device.deviceName);
                if (deviceIndex === -1) return prev;
                
                const newDevices = [...prev];
                newDevices[deviceIndex] = { 
                  ...newDevices[deviceIndex], 
                  isChecked: true, 
                  deviceType2Id: newDeviceType2Id 
                };
                return newDevices;
              });
            } catch (error) {
              console.error(`Failed to add device ${device.deviceName}:`, error);
              // Continue with next device even if one fails
            }
          }
        }
        
        // Refresh to sync IDs after bulk add
        await fetchActiveDevices();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update devices';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error toggling all devices:', error);
      // Refresh to sync state
      await fetchActiveDevices();
    } finally {
      setProcessingToggle(null);
    }
  };

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

  const handleSortToggle = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const allPageItemsChecked = paginatedData.length > 0 && paginatedData.every(device => device.isChecked);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
              {hasPermission('View') && (
                <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loadingDevices || loadingActiveDevices ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading device types...</div>
                </div>
              ) : deviceError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{deviceError}</p>
                </div>
              ) : hasPermission('View') ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left w-12">
                          <input
                            type="checkbox"
                            checked={allPageItemsChecked}
                            onChange={handleToggleAll}
                            disabled={processingToggle !== null}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
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
                            className={`hover:bg-gray-50 transition-colors ${
                              device.isChecked ? 'bg-blue-50' : ''
                            } ${processingToggle === device.id ? 'opacity-50' : ''}`}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={device.isChecked}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleDevice(device.id, device.deviceName);
                                }}
                                disabled={processingToggle !== null}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                              />
                            </td>
                            <td 
                              className={`px-6 py-4 text-sm cursor-pointer ${
                                device.isChecked ? 'text-blue-700' : 'text-gray-900'
                              }`}
                              onClick={() => handleToggleDevice(device.id, device.deviceName)}
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
                </div> ) : (
                  <div className="text-center py-10 text-gray-500">
                      You do not have permission to view this list.
                  </div>
              )}
            </div>

            {/* Pagination */}
            {hasPermission('View') && (
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
            </div>)}
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