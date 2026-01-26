import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LeaveType {
  code: string;
  description: string;
}

interface LeaveCodeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
}

const leaveTypes: LeaveType[] = [
  { code: 'BL', description: 'Birthday Leave' },
  { code: 'HL', description: 'Home Leave' },
  { code: 'PL', description: 'Paternity Leave' },
  { code: 'SL', description: 'Sick Leave' },
  { code: 'SPL', description: 'Solo Parent Leave' },
  { code: 'VL', description: 'Vacation Leave' },
  { code: 'WN', description: 'Leave with notice' },
];

export function LeaveCodeSearchModal({
  isOpen,
  onClose,
  onSelect
}: LeaveCodeSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLeaveTypes = leaveTypes.filter(
    (leave) =>
      leave.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onSelect(code);
    onClose();
    setSearchTerm('');
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 z-30"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">Search</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-4">Leave Type</h3>
            
            {/* Search Field */}
            <div className="mb-4 flex items-center gap-2">
              <label className="text-gray-700">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search by code or description..."
              />
            </div>

            {/* Table */}
            <div className="border border-gray-300 rounded overflow-hidden max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 border-b border-gray-300 text-gray-700">
                      Code ▲
                    </th>
                    <th className="text-left px-4 py-2 border-b border-gray-300 text-gray-700">
                      Description ▲
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaveTypes.map((leave) => (
                    <tr
                      key={leave.code}
                      onClick={() => handleSelect(leave.code)}
                      className="hover:bg-blue-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <td className="px-4 py-2">{leave.code}</td>
                      <td className="px-4 py-2">{leave.description}</td>
                    </tr>
                  ))}
                  {filteredLeaveTypes.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing 1 to {filteredLeaveTypes.length} of {filteredLeaveTypes.length} entries
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded bg-white text-blue-600">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}