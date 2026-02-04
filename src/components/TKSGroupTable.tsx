import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import apiClient from '../services/apiClient';


interface TKSGroupTableProps {
  selectedCodes: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
}

type SortField = 'groupCode' | 'groupDescription';
type SortDirection = 'asc' | 'desc';



export function TKSGroupTable({ selectedCodes, onToggle, onSelectAll }: TKSGroupTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('groupCode');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const itemsPerPage = 10;
  const [tksGroupList, setTKSGroupList] = useState<Array<{ id: number; groupCode: string; groupDescription: string;}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        error;
        try {
            const response = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
            if (response.data) {
                const mappedData = response.data.map((tksGroupList: any) => ({
                    id: tksGroupList.id || tksGroupList.ID || '',
                    groupCode: tksGroupList.groupCode || tksGroupList.GroupCode || '',
                    groupDescription: tksGroupList.groupDescription || tksGroupList.GroupDescription || ''

                }));
                setTKSGroupList(mappedData);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load TKS Group';
            setError(errorMsg);
            console.error('Error fetching TKSGroup:', error);
        } finally {
            loading;
        }
    };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const filteredAndSortedData = tksGroupList.filter(tksGroupList =>
      tksGroupList.groupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tksGroupList.groupDescription.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-gray-400" />
          <ChevronDown className="w-3 h-3 text-gray-400 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-blue-600 ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600 ml-1" />
    );
  };

   useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

  return (
    <div className="lg:col-span-2 bg-gray-50 rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">TKS Group</h3>
        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
          {selectedCodes.length} selected
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2">Search:</label>
        <input
          type="text"
          placeholder="Search codes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left" style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedCodes.length === tksGroupList.length}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-2 text-left text-xs text-gray-600" style={{ width: '80px' }}>
                  <button
                    onClick={() => handleSort('groupCode')}
                    className="flex items-center hover:text-gray-900"
                  >
                    Code
                    <SortIcon field="groupCode" />
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">
                  <button
                    onClick={() => handleSort('groupCode')}
                    className="flex items-center hover:text-gray-900"
                  >
                    Description
                    <SortIcon field="groupDescription" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedCodes.includes(item.id)}
                      onChange={() => onToggle(item.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.groupCode}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{item.groupDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => setCurrentPage(page)}
                className={`px-2 py-1 rounded text-xs ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2">
                {page}
              </span>
            )
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}