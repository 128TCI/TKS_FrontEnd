import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface User {
  userId: string;
  username: string;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (userId: string, username: string) => void;
}

export function UserSearchModal({ isOpen, onClose, onSelect }: UserSearchModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch users when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/AuditTrail/GetAuditTrail/UserIds'); // returns array of usernames
        const mappedUsers: User[] = (response.data || []).map((u: string) => ({
          userId: u, // still keep ID for onSelect
          username: u,
        }));
        setUsers(mappedUsers);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load users.');
        console.error('User fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [isOpen]);

  // ESC key handling
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Filter users
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
            <h2 className="text-gray-800 text-sm">Search Users</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-gray-700 text-sm">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Search by username..."
              />
            </div>

            {error && <p className="text-red-700 text-xs mb-2">{error}</p>}
            {loading ? (
              <p className="text-gray-600 text-sm py-8 text-center">Loading users...</p>
            ) : (
              <table className="w-full border-collapse text-sm border border-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-1.5 text-left border-b border-gray-300">Username</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map(u => (
                      <tr
                        key={u.userId}
                        className="hover:bg-blue-50 cursor-pointer border-b border-gray-200"
                        onClick={() => {
                          onSelect(u.userId, u.username);
                          onClose();
                        }}
                      >
                        <td className="px-3 py-1.5">{u.username}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={1} className="text-center text-gray-500 py-4 text-sm">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {paginatedUsers.length > 0 && (
            <div className="flex justify-between mt-3 text-xs items-center">
                <div>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
                </div>
                <div className="flex gap-2 items-center">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
