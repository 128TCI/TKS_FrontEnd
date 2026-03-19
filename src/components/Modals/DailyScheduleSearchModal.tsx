import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface DailySchedule {
  dailyScheduleID: number;
  referenceNo: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface DailyScheduleSearchModalProps {
  isOpen: boolean;
  isEditMode?: boolean;
  onClose: () => void;
  onSelect: (referenceNo: string) => void;
  // kept optional so old pages that still pass these props don't break
  dailySchedules?: DailySchedule[];
  loading?: boolean;
}

export function DailyScheduleSearchModal({
  isOpen,
  isEditMode = true,
  onClose,
  onSelect,
  dailySchedules: externalSchedules,
  loading: externalLoading,
}: DailyScheduleSearchModalProps) {
  const [searchTerm,          setSearchTerm]          = useState('');
  const [internalSchedules,   setInternalSchedules]   = useState<DailySchedule[]>([]);
  const [internalLoading,     setInternalLoading]     = useState(false);

  // If parent passes dailySchedules/loading, use those; otherwise self-fetch
  const isSelfFetch   = externalSchedules === undefined;
  const dailySchedules = isSelfFetch ? internalSchedules : externalSchedules;
  const loading        = isSelfFetch ? internalLoading   : (externalLoading ?? false);

  // Self-fetch on open (only when no external data is provided)
  useEffect(() => {
    if (!isOpen || !isEditMode) return;
    setSearchTerm('');
    if (isSelfFetch) fetchDailySchedules();
  }, [isOpen, isEditMode]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen || !isEditMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditMode, onClose]);

  const fetchDailySchedules = async () => {
    setInternalLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/DailyScheduleSetUp');
      if (response.status === 200 && response.data) {
        const schedules = response.data.data;
        const mappedData = schedules.map((schedule: any) => ({
          dailyScheduleID: schedule.dailyScheduleID || 0,
          referenceNo:     schedule.referenceNo     || '',
          monday:          schedule.monday          || '',
          tuesday:         schedule.tuesday         || '',
          wednesday:       schedule.wednesday       || '',
          thursday:        schedule.thursday        || '',
          friday:          schedule.friday          || '',
          saturday:        schedule.saturday        || '',
          sunday:          schedule.sunday          || '',
        }));
        setInternalSchedules(mappedData);
      }
    } catch (error: any) {
      console.error('Error fetching daily schedules:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  if (!isOpen || !isEditMode) return null;

  const filteredSchedules = (Array.isArray(dailySchedules) ? dailySchedules : []).filter(schedule =>
    (schedule.referenceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Fix duplicate key warning — fallback to index if dailyScheduleID is 0
  const getKey = (schedule: DailySchedule, index: number) =>
    schedule.dailyScheduleID !== 0 ? schedule.dailyScheduleID : `fallback-${index}`;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800 text-sm">Select Daily Schedule</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 50px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-gray-700 text-sm">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by reference number..."
                autoFocus
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading daily schedules...</div>
            ) : (
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Reference No</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Mon</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Tue</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Wed</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Thu</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Fri</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Sat</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                          No daily schedules found
                        </td>
                      </tr>
                    ) : (
                      filteredSchedules.map((schedule, index) => (
                        <tr
                          key={getKey(schedule, index)}
                          className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            onSelect(schedule.referenceNo);
                            onClose();
                          }}
                        >
                          <td className="px-3 py-1.5">{schedule.referenceNo}</td>
                          <td className="px-3 py-1.5">{schedule.monday}</td>
                          <td className="px-3 py-1.5">{schedule.tuesday}</td>
                          <td className="px-3 py-1.5">{schedule.wednesday}</td>
                          <td className="px-3 py-1.5">{schedule.thursday}</td>
                          <td className="px-3 py-1.5">{schedule.friday}</td>
                          <td className="px-3 py-1.5">{schedule.saturday}</td>
                          <td className="px-3 py-1.5">{schedule.sunday}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}