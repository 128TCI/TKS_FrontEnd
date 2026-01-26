import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, XCircle, ArrowUpDown, Check } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface HolidayOTRate {
    code: string;
    description: string;
    holidayType: string;
}

export function HolidayOTRateSetupPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState<number | null>(0);

    const [existingRecords] = useState<HolidayOTRate[]>([
        { code: 'LEGAL', description: 'Legal Holiday', holidayType: 'Legal' },
        { code: 'LEGAL_D', description: 'Legal Holiday Daily', holidayType: 'Legal' },
        { code: 'SPECIAL', description: 'Special Holiday', holidayType: 'Special National' },
        { code: 'SPECIAL_D', description: 'Special Holiday Daily', holidayType: 'Special National' }
    ]);

    const [formData, setFormData] = useState({
        code: 'LEGAL',
        description: 'Legal Holiday',
        holidayType: 'Legal Holiday',
        withinShift: 'OTLHF8',
        withinShiftND: 'NDLHF8',
        otPremiumWithinShiftND: 'OTLHF8',
        afterShift: 'OTLHX8',
        afterShiftND: 'NDLHX8',
        otPremiumAfterShiftND: 'OTLHX8',
        withinShiftRestday: 'OTLHRDF8',
        withinShiftRestdayND: 'NDLHRDF8',
        otPremiumWithinShiftRestdayND: 'OTLHRDF8',
        afterShiftRestday: 'OTLHRDX8',
        afterShiftRestdayND: 'NDLHRDX8',
        otPremiumAfterShiftRestdayND: 'OTLHRDX8',
        unworkedHolidayPay: 'HOLIDAY',
        unworkedHolidayPayRestday: 'HOLIDAY',
        equivalentOTCodeNoHrs: '',
        afterTheShift: '',
        afterTheShiftRestDay: '',
        afterTheShiftWithND: '',
        afterTheShiftRestDayWithND: '',
        equivalentOTCodeWithinShift: '',
        equivalentOTCodeWithinShiftRestDay: ''
    });

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

    const handleCreateNew = () => {
        setIsEditing(true);
        setSelectedRow(null);
        // Reset form or open new entry
        setFormData({
            code: '',
            description: '',
            holidayType: '',
            withinShift: '',
            withinShiftND: '',
            otPremiumWithinShiftND: '',
            afterShift: '',
            afterShiftND: '',
            otPremiumAfterShiftND: '',
            withinShiftRestday: '',
            withinShiftRestdayND: '',
            otPremiumWithinShiftRestdayND: '',
            afterShiftRestday: '',
            afterShiftRestdayND: '',
            otPremiumAfterShiftRestdayND: '',
            unworkedHolidayPay: '',
            unworkedHolidayPayRestday: '',
            equivalentOTCodeNoHrs: '',
            afterTheShift: '',
            afterTheShiftRestDay: '',
            afterTheShiftWithND: '',
            afterTheShiftRestDayWithND: '',
            equivalentOTCodeWithinShift: '',
            equivalentOTCodeWithinShiftRestDay: ''
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRowClick = (index: number) => {
        setSelectedRow(index);
        const record = existingRecords[index];
        setFormData({
            code: record.code,
            description: record.description,
            holidayType: record.holidayType,
            withinShift: 'OTLHF8',
            withinShiftND: 'NDLHF8',
            otPremiumWithinShiftND: 'OTLHF8',
            afterShift: 'OTLHX8',
            afterShiftND: 'NDLHX8',
            otPremiumAfterShiftND: 'OTLHX8',
            withinShiftRestday: 'OTLHRDF8',
            withinShiftRestdayND: 'NDLHRDF8',
            otPremiumWithinShiftRestdayND: 'OTLHRDF8',
            afterShiftRestday: 'OTLHRDX8',
            afterShiftRestdayND: 'NDLHRDX8',
            otPremiumAfterShiftRestdayND: 'OTLHRDX8',
            unworkedHolidayPay: 'HOLIDAY',
            unworkedHolidayPayRestday: 'HOLIDAY',
            equivalentOTCodeNoHrs: '',
            afterTheShift: '',
            afterTheShiftRestDay: '',
            afterTheShiftWithND: '',
            afterTheShiftRestDayWithND: '',
            equivalentOTCodeWithinShift: '',
            equivalentOTCodeWithinShiftRestDay: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Holiday OT Rate Setup</h1>
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
                                        Define overtime rate codes and premium calculations for holidays. Configure rates for regular shifts, night differential, rest days, and their combinations to ensure accurate holiday pay computations.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Within shift and after shift OT rates</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Night differential premium calculations</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Rest day combination rates</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Unworked holiday pay configuration</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mb-6">
                            {!isEditing && (
                                <button
                                    onClick={handleCreateNew}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create New
                                </button>
                            )}
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </>
                            )}
                            {!isEditing && (
                                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </div>

                        {/* Records Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                                    Code
                                                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                                    Description
                                                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                                    Holiday Type
                                                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {existingRecords.map((record, index) => (
                                            <tr
                                                key={index}
                                                onClick={() => handleRowClick(index)}
                                                className={`cursor-pointer transition-colors ${selectedRow === index
                                                        ? 'bg-blue-50 hover:bg-blue-100'
                                                        : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td className="px-6 py-3 text-gray-900">{record.code}</td>
                                                <td className="px-6 py-3 text-gray-900">{record.description}</td>
                                                <td className="px-6 py-3 text-gray-900">{record.holidayType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column */}
                                <div className="space-y-5">
                                    {/* Code */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">
                                            Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => handleInputChange('code', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Within the Shift */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Within the Shift <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.withinShift}
                                            onChange={(e) => handleInputChange('withinShift', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* After the Shift */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">After the Shift <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.afterShift}
                                            onChange={(e) => handleInputChange('afterShift', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Within the Shift and Restday */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Within the Shift and Restday <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.withinShiftRestday}
                                            onChange={(e) => handleInputChange('withinShiftRestday', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* After the Shift and Restday */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">After the Shift and Restday <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.afterShiftRestday}
                                            onChange={(e) => handleInputChange('afterShiftRestday', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Unworked Holiday Pay */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Unworked Holiday Pay <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.unworkedHolidayPay}
                                            onChange={(e) => handleInputChange('unworkedHolidayPay', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Unworked Holiday Pay (Restday) */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Unworked Holiday Pay (Restday) <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.unworkedHolidayPayRestday}
                                            onChange={(e) => handleInputChange('unworkedHolidayPayRestday', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Middle Column */}
                                <div className="space-y-5">
                                    {/* Description */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Within the Shift With ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Within the Shift With ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.withinShiftND}
                                            onChange={(e) => handleInputChange('withinShiftND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* After the Shift With ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">After the Shift With ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.afterShiftND}
                                            onChange={(e) => handleInputChange('afterShiftND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Within the Shift and Restday with ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Within the Shift and Restday with ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.withinShiftRestdayND}
                                            onChange={(e) => handleInputChange('withinShiftRestdayND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* After the Shift and Restday with ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">After the Shift and Restday with ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.afterShiftRestdayND}
                                            onChange={(e) => handleInputChange('afterShiftRestdayND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-5">
                                    {/* Holiday Type */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">
                                            Holiday Type <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.holidayType}
                                            onChange={(e) => handleInputChange('holidayType', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* OT Premium Within the Shift with ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">OT Premium Within the Shift with ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.otPremiumWithinShiftND}
                                            onChange={(e) => handleInputChange('otPremiumWithinShiftND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* OT Premium After the Shift with ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">OT Premium After the Shift with ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.otPremiumAfterShiftND}
                                            onChange={(e) => handleInputChange('otPremiumAfterShiftND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* OT Premium Within the Shift and Restday with ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">OT Premium Within the Shift and Restday with ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.otPremiumWithinShiftRestdayND}
                                            onChange={(e) => handleInputChange('otPremiumWithinShiftRestdayND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* OT Premium After the Shift and Restday with ND */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">OT Premium After the Shift and Restday with ND <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.otPremiumAfterShiftRestdayND}
                                            onChange={(e) => handleInputChange('otPremiumAfterShiftRestdayND', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Equivalent OT Code of Within in the Shift */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Equivalent OT Code of Within in the Shift</label>
                                        <input
                                            type="text"
                                            value={formData.equivalentOTCodeWithinShift}
                                            onChange={(e) => handleInputChange('equivalentOTCodeWithinShift', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>

                                    {/* Equivalent OT Code of Within in the Shift and Rest Day */}
                                    <div>
                                        <label className="block text-gray-700 mb-2">Equivalent OT Code of Within in the Shift and Rest Day</label>
                                        <input
                                            type="text"
                                            value={formData.equivalentOTCodeWithinShiftRestDay}
                                            onChange={(e) => handleInputChange('equivalentOTCodeWithinShiftRestDay', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional OT Configuration Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h3 className="text-gray-900 mb-6">Additional Equivalent OT Codes</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* After The Shift */}
                                <div>
                                    <label className="block text-gray-700 mb-2">After The Shift :</label>
                                    <input
                                        type="text"
                                        value={formData.afterTheShift}
                                        onChange={(e) => handleInputChange('afterTheShift', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                {/* After The Shift and Rest Day */}
                                <div>
                                    <label className="block text-gray-700 mb-2">After The Shift and Rest Day :</label>
                                    <input
                                        type="text"
                                        value={formData.afterTheShiftRestDay}
                                        onChange={(e) => handleInputChange('afterTheShiftRestDay', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                {/* After The Shift With ND */}
                                <div>
                                    <label className="block text-gray-700 mb-2">After The Shift With ND :</label>
                                    <input
                                        type="text"
                                        value={formData.afterTheShiftWithND}
                                        onChange={(e) => handleInputChange('afterTheShiftWithND', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                {/* After The Shift and Rest Day With ND */}
                                <div>
                                    <label className="block text-gray-700 mb-2">After The Shift and Rest Day With ND :</label>
                                    <input
                                        type="text"
                                        value={formData.afterTheShiftRestDayWithND}
                                        onChange={(e) => handleInputChange('afterTheShiftRestDayWithND', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">Note:</span> Fields marked with <span className="text-red-500">*</span> are required.
                                Holiday OT rates are used to calculate overtime premiums for employees working during holidays.
                            </p>
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