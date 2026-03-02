import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface WorkshiftSearchModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (code: string, description: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

interface WorkshiftItem {
  workShiftCode: string;
  workShiftDesc: string;
}

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    }
    else if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    }
    else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-3 px-2 pb-2">
      <div className="text-gray-600 text-sm">
        Showing {totalCount === 0 ? 0 : startIndex + 1} to {endIndex} of {totalCount}
      </div>

      <div className="flex gap-1">

        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={idx} className="px-2 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>

      </div>
    </div>
  );
}

export function WorkshiftCodeSearchModal({
  show,
  onClose,
  onSelect,
  searchTerm,
  setSearchTerm
}: WorkshiftSearchModalProps) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [workshiftData, setWorkshiftData] = useState<WorkshiftItem[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 10;

  const fetchWorkshifts = async (page = currentPage) => {

    setLoading(true);
    setError('');

    try {

      const start = (page - 1) * pageSize;

      const response = await apiClient.get(
        '/Fs/Process/WorkshiftSetUp',
        {
          params: {
            code: searchTerm || '',
            start,
            length: pageSize
          }
        }
      );

      const rows = response.data?.data || [];

      setWorkshiftData(
        rows.map((row: any) => ({
          workShiftCode: row.workShiftCode || row.code,
          workShiftDesc: row.workShiftDesc || row.description
        }))
      );

      setTotalCount(
        response.data?.recordsTotal ??
        response.data?.totalCount ??
        rows.length
      );

    }
    catch (err: any) {

      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed loading workshift'
      );

    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      setCurrentPage(1);
      fetchWorkshifts(1);
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    const debounce = setTimeout(() => {
      setCurrentPage(1);
      fetchWorkshifts(1);
    }, 350);

    return () => clearTimeout(debounce);

  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchWorkshifts(page);
  };

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h2 className="text-sm text-gray-800">
              Search Workshift
            </h2>

            <button onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3">

            <div className="flex gap-2 mb-3">
              <input
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                placeholder="Search code or description"
                className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm mb-2">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="border rounded max-h-[350px] overflow-y-auto">

              <table className="w-full text-sm">

                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100 border-b">
                    <th className="px-3 py-1.5 text-left">
                      Code
                    </th>
                    <th className="px-3 py-1.5 text-left">
                      Description
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {loading && (
                    <tr>
                      <td colSpan={2} className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  )}

                  {!loading && workshiftData.map(ws => (
                    <tr
                      key={ws.workShiftCode}
                      className="border-b hover:bg-blue-50 cursor-pointer"
                      onClick={()=>{
                        onSelect(ws.workShiftCode, ws.workShiftDesc);
                        onClose();
                      }}
                    >
                      <td className="px-3 py-1.5">
                        {ws.workShiftCode}
                      </td>
                      <td className="px-3 py-1.5">
                        {ws.workShiftDesc}
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />

          </div>
        </div>
      </div>
    </>
  );
}