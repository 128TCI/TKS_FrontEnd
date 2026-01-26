import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';


interface Coordinate {
    id: number;
    code: string;
    description: string;
    latitude: string;
    longitude: string;
    distance: string;
}

export function CoordinatesSetupPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState<Coordinate | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        latitude: '',
        longitude: '',
        distance: ''
    });

    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);

    const itemsPerPage = 10;

    const filteredData = coordinates.filter(item =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.latitude.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.longitude.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.distance.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleCreateNew = () => {
        setFormData({
            code: '',
            description: '',
            latitude: '',
            longitude: '',
            distance: ''
        });
        setShowCreateModal(true);
    };

    const handleEdit = (item: Coordinate) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            description: item.description,
            latitude: item.latitude,
            longitude: item.longitude,
            distance: item.distance
        });
        setShowEditModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this coordinate?')) {
            setCoordinates(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newCoordinate: Coordinate = {
            id: Math.max(...coordinates.map(d => d.id), 0) + 1,
            code: formData.code,
            description: formData.description,
            latitude: formData.latitude,
            longitude: formData.longitude,
            distance: formData.distance
        };
        setCoordinates(prev => [...prev, newCoordinate]);
        setShowCreateModal(false);
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            setCoordinates(prev =>
                prev.map(item =>
                    item.id === editingItem.id
                        ? {
                            ...item,
                            code: formData.code,
                            description: formData.description,
                            latitude: formData.latitude,
                            longitude: formData.longitude,
                            distance: formData.distance
                        }
                        : item
                )
            );
            setShowEditModal(false);
            setEditingItem(null);
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingItem(null);
    };

    // Handle ESC key press
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showCreateModal) {
                    setShowCreateModal(false);
                } else if (showEditModal) {
                    setShowEditModal(false);
                    setEditingItem(null);
                }
            }
        };

        if (showCreateModal || showEditModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showCreateModal, showEditModal]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Coordinates Setup</h1>
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
                                        Define geographic coordinates for workplace locations to enable location-based attendance tracking. Configure latitude and longitude parameters for geofencing and proximity validation.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">GPS-based validation</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Location boundaries</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Multiple work sites</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Geofencing support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                            <button
                                onClick={handleCreateNew}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </button>

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
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Latitude</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Longitude</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Distance</th>
                                        <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.latitude}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.longitude}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.distance}</td>
                                                <td className="px-6 py-4">
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
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
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
                                Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => setCurrentPage(1)}
                                >
                                    1
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                                    disabled={currentPage >= totalPages || filteredData.length === 0}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create New Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Create New</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreate} className="p-6">
                            <h3 className="text-blue-600 mb-4">Coordinates Setup</h3>

                            <div className="space-y-4">
                                {/* Code */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Description :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>

                                {/* Latitude */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Latitude :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Longitude */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Longitude :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Distance */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Distance :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.distance}
                                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Back to List
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Edit Coordinate</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit} className="p-6">
                            <h3 className="text-blue-600 mb-4">Coordinates Setup</h3>

                            <div className="space-y-4">
                                {/* Code */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Description :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>

                                {/* Latitude */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Latitude :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Longitude */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Longitude :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Distance */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                                        Distance :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.distance}
                                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Back to List
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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