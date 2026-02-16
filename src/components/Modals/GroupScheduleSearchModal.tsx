import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GroupSchedule {
  groupScheduleID: number;
  groupScheduleCode: string;
  groupScheduleDesc: string;
}

interface GroupScheduleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  groupSchedules: GroupSchedule[];
  loading: boolean;
}

export function GroupScheduleSearchModal({
  isOpen,
  onClose,
  onSelect,
  groupSchedules,
  loading
}: GroupScheduleSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset search and page when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Filter group schedules based on search term
  const filteredSchedules = groupSchedules.filter(schedule =>
    (schedule.groupScheduleCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (schedule.groupScheduleDesc?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchedules = filteredSchedules.slice(startIndex, endIndex);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800 text-sm">Select Group Schedule</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 50px)' }}>
            <h3 className="text-blue-600 mb-2 text-sm">Group Schedule Setup</h3>

            {/* Search Input */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-gray-700 text-sm">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or description..."
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading group schedules...
              </div>
            ) : (
              <>
                {/* Group Schedule Table */}
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-white">
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">
                          Group Schedule Code
                          <span className="ml-1 text-blue-500">▲</span>
                        </th>
                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">
                          Description
                          <span className="ml-1 text-gray-400">▼</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-3 py-8 text-center text-gray-500">
                            No group schedules found
                          </td>
                        </tr>
                      ) : (
                        currentSchedules.map((schedule) => (
                          <tr 
                            key={schedule.groupScheduleID}
                            className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              onSelect(schedule.groupScheduleCode);
                              onClose();
                            }}
                          >
                            <td className="px-3 py-1.5">{schedule.groupScheduleCode}</td>
                            <td className="px-3 py-1.5">{schedule.groupScheduleDesc}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3">
                  <div className="text-gray-600 text-xs">
                    Showing {filteredSchedules.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredSchedules.length)} of {filteredSchedules.length} entries
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                      typeof page === 'number' ? (
                        <button
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={index} className="px-2 py-1 text-xs text-gray-500">
                          {page}
                        </span>
                      )
                    ))}
                    
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}