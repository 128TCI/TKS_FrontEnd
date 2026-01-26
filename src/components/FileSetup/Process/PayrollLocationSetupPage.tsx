import { useState, useEffect } from 'react';
import { X, Plus, Check, ArrowLeft, Edit, Trash2} from 'lucide-react';
import { Footer } from '../../Footer/Footer';


interface PayrollLocation {
    locId: string;
    description: string;
    payCode: string;
    noOfDays: number;
    noOfHours: number;
    totalPeriod: number;
}

export function PayrollLocationSetupPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        locId: '',
        locName: '',
        payCode: 'Monthly',
        noOfDays: '0',
        noOfHours: '0',
        totalPeriod: '0'
    });

    // Sample data - Payroll Location records
    const [payrollLocationData] = useState<PayrollLocation[]>([
        { locId: '1', description: 'Batangas Balagtas Monthly Payroll', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '10', description: 'Batangas Monthly Cash Payroll with Paycard', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '100', description: '-', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '101', description: 'Main Batangas Daily', payCode: 'Daily', noOfDays: 26, noOfHours: 8, totalPeriod: 2 },
        { locId: '102', description: 'Main Batangas Daily with Paycard', payCode: 'Daily', noOfDays: 26, noOfHours: 8, totalPeriod: 2 },
        { locId: '103', description: 'Main Batangas Monthly', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '104', description: 'Main Batangas Monthly with Paycard', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '105', description: 'Nueva Ecija Monthly Payroll', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '106', description: 'Nueva Ecija Daily Payroll', payCode: 'Daily', noOfDays: 26, noOfHours: 8, totalPeriod: 2 },
        { locId: '107', description: 'Nueva Ecija Monthly Cash Payroll', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '108', description: 'Nueva Ecija Confi Supervisor', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '109', description: 'Pamapanga Bulacan Monthly Cash', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '11', description: 'Batangas Monthly', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '110', description: 'Urdaneta Dagupan Monthly Cash2', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '111', description: 'Nueva Ecija Resigned Monthly', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '112', description: 'Bicol Daraga Monthly Cash2', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '113', description: 'Nueva Ecija Monthly Cash 2', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '114', description: 'Semi monthly v750', payCode: 'Semi-Monthly', noOfDays: 313, noOfHours: 8, totalPeriod: 2 },
        { locId: '115', description: 'CONSULTANT', payCode: 'Daily', noOfDays: 26, noOfHours: 8, totalPeriod: 1 },
        { locId: '12', description: 'Batangas Resigned - Daily Payroll', payCode: 'Daily', noOfDays: 26, noOfHours: 8, totalPeriod: 2 },
        { locId: '13', description: 'Batangas Resigned - Monthly Payroll', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '14', description: 'Bicol Supervisors & Managers', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 },
        { locId: '15', description: 'Bicol Daily', payCode: 'Daily', noOfDays: 26, noOfHours: 8, totalPeriod: 2 },
        { locId: '16', description: 'Bicol Daily Cash Payroll with Paycard', payCode: 'Daily', noOfDays: 26, noOfHours: 8, totalPeriod: 2 },
        { locId: '17', description: 'Bicol Daraga Satellite', payCode: 'Semi-Monthly', noOfDays: 312, noOfHours: 8, totalPeriod: 2 }
    ]);

    const filteredData = payrollLocationData.filter(item =>
        item.locId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.payCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination for main table
    const itemsPerPage = 25;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const handleCreateNew = () => {
        setFormData({
            locId: '',
            locName: '',
            payCode: 'Monthly',
            noOfDays: '0',
            noOfHours: '0',
            totalPeriod: '0'
        });
        setIsEditing(false);
        setShowCreateModal(true);
    };

    const handleEdit = (item: PayrollLocation) => {
        setFormData({
            locId: item.locId,
            locName: item.description,
            payCode: item.payCode,
            noOfDays: item.noOfDays.toString(),
            noOfHours: item.noOfHours.toString(),
            totalPeriod: item.totalPeriod.toString()
        });
        setIsEditing(true);
        setShowCreateModal(true);
    };

    // Handle ESC key press to close modals
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showCreateModal) {
                    setShowCreateModal(false);
                }
            }
        };

        if (showCreateModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showCreateModal]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Payroll Location Setup</h1>
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
                                        Define payroll locations with specific pay schedules and period configurations. Set up location-based payroll processing parameters including pay codes, working days, hours, and total periods.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Location-specific pay schedules</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Daily and semi-monthly configurations</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Working days and hours setup</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Total period definitions</span>
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-gray-700">Loc Id ▲</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Description</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Pay Code</th>
                                        <th className="px-4 py-2 text-left text-gray-700">No. of Days</th>
                                        <th className="px-4 py-2 text-left text-gray-700">No. of Hours</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Total Period</th>
                                        <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-2">{item.locId}</td>
                                            <td className="px-4 py-2">{item.description}</td>
                                            <td className="px-4 py-2">{item.payCode}</td>
                                            <td className="px-4 py-2">{item.noOfDays}</td>
                                            <td className="px-4 py-2">{item.noOfHours}</td>
                                            <td className="px-4 py-2">{item.totalPeriod}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
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
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`px-3 py-1 rounded ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Create/Edit Modal */}
                        {showCreateModal && (
                            <>
                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                            <h2 className="text-gray-800">{isEditing ? 'Edit' : 'Create New'}</h2>
                                            <button
                                                onClick={() => setShowCreateModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-4">
                                            <h3 className="text-blue-600 mb-3">Payroll Location Setup</h3>

                                            {/* Form Fields */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">LocID :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.locId}
                                                        onChange={(e) => setFormData({ ...formData, locId: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Loc Name :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.locName}
                                                        onChange={(e) => setFormData({ ...formData, locName: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Pay Code :</label>
                                                    <select
                                                        value={formData.payCode}
                                                        onChange={(e) => setFormData({ ...formData, payCode: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    >
                                                        <option value="Monthly">Monthly</option>
                                                        <option value="Semi-Monthly">Semi-Monthly</option>
                                                        <option value="Daily">Daily</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">No. Of Days :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.noOfDays}
                                                        onChange={(e) => setFormData({ ...formData, noOfDays: e.target.value })}
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">No. Of Hours :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.noOfHours}
                                                        onChange={(e) => setFormData({ ...formData, noOfHours: e.target.value })}
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Total Period :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.totalPeriod}
                                                        onChange={(e) => setFormData({ ...formData, totalPeriod: e.target.value })}
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Modal Actions */}
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => setShowCreateModal(false)}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                                >
                                                    {isEditing ? 'Update' : 'Submit'}
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
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}