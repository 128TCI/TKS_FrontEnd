import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  onClose: () => void;
  onSelect: (referenceNo: string) => void;
  dailySchedules: DailySchedule[];
  loading: boolean;
}

export function DailyScheduleSearchModal({
  isOpen,
  onClose,
  onSelect,
  dailySchedules = [],
  loading
}: DailyScheduleSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSchedules = (Array.isArray(dailySchedules) ? dailySchedules : []).filter(schedule =>
    (schedule.referenceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
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
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading daily schedules...</div>
            ) : (
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-white">
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
                      filteredSchedules.map((schedule) => (
                        <tr
                          key={schedule.dailyScheduleID}
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