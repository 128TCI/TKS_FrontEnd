/**
 * REUSABLE MODAL COMPONENTS - Usage Guide
 * 
 * Two reusable modal components have been created to handle employee and device searches:
 * 1. EmployeeSearchModal - Located at: src/components/Modals/EmployeeSearchModal.tsx
 * 2. DeviceSearchModal - Located at: src/components/Modals/DeviceSearchModal.tsx
 * 
 * ============================================================================
 * HOW TO USE IN YOUR COMPONENT
 * ============================================================================
 * 
 * 1. IMPORT THE COMPONENTS
 * ─────────────────────────
 * 
 *    import { EmployeeSearchModal } from '../../Modals/EmployeeSearchModal';
 *    import { DeviceSearchModal } from '../../Modals/DeviceSearchModal';
 * 
 * 
 * 2. ADD STATE FOR MODAL VISIBILITY
 * ──────────────────────────────────
 * 
 *    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
 *    const [employeeData, setEmployeeData] = useState<Array<{
 *        empCode: string;
 *        name: string;
 *        groupCode: string;
 *    }>>([]);
 *    const [loadingEmployees, setLoadingEmployees] = useState(false);
 *    const [employeeError, setEmployeeError] = useState('');
 * 
 *    // Similar for devices...
 * 
 * 
 * 3. FETCH YOUR DATA (e.g., from API)
 * ────────────────────────────────────
 * 
 *    useEffect(() => {
 *        const fetchEmployees = async () => {
 *            try {
 *                setLoadingEmployees(true);
 *                const response = await apiClient.get('/EmployeeMasterFile');
 *                const mapped = response.data.map((emp: any) => ({
 *                    empCode: emp.empCode || '',
 *                    name: `${emp.lName}, ${emp.fName} ${emp.mName}`.trim(),
 *                    groupCode: emp.grpCode || ''
 *                }));
 *                setEmployeeData(mapped);
 *            } catch (error) {
 *                setEmployeeError('Failed to load employees');
 *            } finally {
 *                setLoadingEmployees(false);
 *            }
 *        };
 *        fetchEmployees();
 *    }, []);
 * 
 * 
 * 4. HANDLE SELECTION
 * ────────────────────
 * 
 *    const handleEmployeeSelect = (empCode: string, name: string) => {
 *        setSelectedEmployeeCode(empCode);
 *        setSelectedEmployeeName(name);
 *        // Do whatever you need with the selected employee
 *    };
 * 
 *    // Similar for devices...
 * 
 * 
 * 5. RENDER THE MODAL COMPONENT
 * ──────────────────────────────
 * 
 *    <EmployeeSearchModal
 *        isOpen={showEmployeeModal}
 *        onClose={() => setShowEmployeeModal(false)}
 *        onSelect={handleEmployeeSelect}
 *        employees={employeeData}
 *        loading={loadingEmployees}
 *        error={employeeError}
 *    />
 * 
 *    <DeviceSearchModal
 *        isOpen={showDeviceModal}
 *        onClose={() => setShowDeviceModal(false)}
 *        onSelect={handleDeviceSelect}
 *        devices={deviceData}
 *        loading={loadingDevices}
 *        error={deviceError}
 *    />
 * 
 * 
 * 6. TRIGGER THE MODAL
 * ─────────────────────
 * 
 *    <button onClick={() => setShowEmployeeModal(true)}>
 *        Search Employee
 *    </button>
 * 
 * 
 * ============================================================================
 * COMPONENT PROPS
 * ============================================================================
 * 
 * EMPLOYEE SEARCH MODAL
 * ─────────────────────
 * 
 * interface EmployeeSearchModalProps {
 *     isOpen: boolean;                                    // Controls modal visibility
 *     onClose: () => void;                               // Called when modal should close
 *     onSelect: (empCode: string, name: string) => void; // Called when employee is selected
 *     employees: Array<{                                 // List of employees to search
 *         empCode: string;
 *         name: string;
 *         groupCode: string;
 *     }>;
 *     loading: boolean;                                  // Show loading spinner
 *     error: string;                                     // Show error message
 * }
 * 
 * 
 * DEVICE SEARCH MODAL
 * ───────────────────
 * 
 * interface DeviceSearchModalProps {
 *     isOpen: boolean;                                         // Controls modal visibility
 *     onClose: () => void;                                    // Called when modal should close
 *     onSelect: (deviceID: string, deviceName: string) => void; // Called when device is selected
 *     devices: Array<{                                        // List of devices to search
 *         deviceID: string;
 *         deviceName: string;
 *     }>;
 *     loading: boolean;                                       // Show loading spinner
 *     error: string;                                          // Show error message
 * }
 * 
 * 
 * ============================================================================
 * FEATURES
 * ============================================================================
 * 
 * ✓ Automatic pagination (20 items per page)
 * ✓ Smart pagination display with ellipsis (fits dialog width)
 * ✓ Real-time search/filtering
 * ✓ Loading states
 * ✓ Error handling
 * ✓ ESC key to close
 * ✓ Click outside backdrop to close
 * ✓ Reusable in any component
 * ✓ Fully typed TypeScript
 * 
 * 
 * ============================================================================
 * EXAMPLE: COMPLETE COMPONENT WITH EMPLOYEE MODAL
 * ============================================================================
 * 
 * import { useState, useEffect } from 'react';
 * import { EmployeeSearchModal } from '../../Modals/EmployeeSearchModal';
 * import apiClient from '../../services/apiClient';
 * 
 * export function MyComponent() {
 *     const [showModal, setShowModal] = useState(false);
 *     const [selectedEmp, setSelectedEmp] = useState('');
 *     const [employees, setEmployees] = useState([]);
 *     const [loading, setLoading] = useState(false);
 *     const [error, setError] = useState('');
 * 
 *     useEffect(() => {
 *         const fetch = async () => {
 *             setLoading(true);
 *             try {
 *                 const res = await apiClient.get('/EmployeeMasterFile');
 *                 setEmployees(res.data.map((e: any) => ({
 *                     empCode: e.empCode,
 *                     name: `${e.lName}, ${e.fName} ${e.mName}`.trim(),
 *                     groupCode: e.grpCode
 *                 })));
 *             } catch (err: any) {
 *                 setError(err.message);
 *             } finally {
 *                 setLoading(false);
 *             }
 *         };
 *         fetch();
 *     }, []);
 * 
 *     return (
 *         <>
 *             <button onClick={() => setShowModal(true)}>
 *                 Select Employee: {selectedEmp}
 *             </button>
 * 
 *             <EmployeeSearchModal
 *                 isOpen={showModal}
 *                 onClose={() => setShowModal(false)}
 *                 onSelect={(code, name) => {
 *                     setSelectedEmp(`${code} - ${name}`);
 *                     setShowModal(false);
 *                 }}
 *                 employees={employees}
 *                 loading={loading}
 *                 error={error}
 *             />
 *         </>
 *     );
 * }
 * 
 */
