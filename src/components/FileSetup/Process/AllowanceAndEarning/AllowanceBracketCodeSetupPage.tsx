import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

export function AllowanceBracketCodeSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  
  // Sample data for the list
  const [bracketList, setBracketList] = useState([
    { code: 'ALLOW1', description: 'Allowance Bracket 11' },
    { code: 'z', description: 'zz' },
  ]);

  // Handle ESC key to close modals
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

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedIndex(null);
    // Clear form
    setCode('');
    setDescription('');
    setShowCreateModal(true);
  };

  const handleEdit = (item: any, index: number) => {
    setIsEditMode(true);
    setSelectedIndex(index);
    setCode(item.code);
    setDescription(item.description);
    setShowCreateModal(true);
  };

  const handleDelete = (itemCode: string) => {
    if (window.confirm('Are you sure you want to delete this allowance bracket?')) {
      setBracketList(bracketList.filter(item => item.code !== itemCode));
    }
  };

  const handleSubmit = () => {
    // Validate code
    if (!code.trim()) {
      alert('Please enter a Code.');
      return;
    }

    if (isEditMode && selectedIndex !== null) {
      // Update existing record
      const updatedList = [...bracketList];
      updatedList[selectedIndex] = {
        code: code,
        description: description,
      };
      setBracketList(updatedList);
    } else {
      // Create new record
      const newBracket = {
        code: code,
        description: description,
      };
      setBracketList([...bracketList, newBracket]);
    }

    // Close modal and reset form
    setShowCreateModal(false);
    setCode('');
    setDescription('');
    setIsEditMode(false);
    setSelectedIndex(null);
  };

  const filteredBrackets = bracketList.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
  <div className="min-h-screen bg-white flex flex-col">
    {/* Main Content */}
    <div className="flex-1 relative z-10 p-6">
    <div className="max-w-7xl mx-auto relative">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
        <h1 className="text-white">Allowance Bracket Code Setup</h1>
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
                Define and manage allowance bracket codes used for categorizing and organizing different types of employee allowances and benefits within the payroll system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Bracket code creation and management</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Allowance categorization</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Flexible bracket configuration</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Integration with allowance bracketing</span>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrackets.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-gray-900">{item.code}</td>
                  <td className="px-4 py-2 text-gray-600">{item.description}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleEdit(item, index)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                        >
                        <Edit className="w-4 h-4" />
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={() => handleDelete(item.code)}
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
            Showing 1 to {filteredBrackets.length} of {filteredBrackets.length} entries
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <>
            {/* Modal Backdrop */}
            <div 
              className="fixed inset-0 bg-black/30 z-10"
              onClick={() => setShowCreateModal(false)}
            ></div>

            {/* Modal Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                  <h2 className="text-gray-800">{isEditMode ? 'Edit' : 'Create New'}</h2>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4">
                  <h3 className="text-blue-600 mb-3">Allowance Bracket Code Setup</h3>

                  {/* Form Fields */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="w-32 text-gray-700 text-sm">Code :</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-32 text-gray-700 text-sm">Description :</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                    >
                      {isEditMode ? 'Update' : 'Submit'}
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