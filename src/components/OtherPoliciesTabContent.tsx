import { Search, X } from 'lucide-react';

interface OtherPoliciesTabContentProps {
  tksGroupCode: string;
  tksGroupDescription: string;
  isEditMode: boolean;
}

export function OtherPoliciesTabContent({ 
  tksGroupCode, 
  tksGroupDescription, 
  isEditMode 
}: OtherPoliciesTabContentProps) {
  const checkboxClass = "w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6">
      {/* Group Code and Definition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="w-40 text-gray-700 text-sm flex-shrink-0">TKS Group Code</label>
          <input
            type="text"
            value={tksGroupCode}
            disabled
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-48 text-gray-700 text-sm flex-shrink-0">TKS Group Definition</label>
          <input
            type="text"
            value={tksGroupDescription}
            disabled
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Restday Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">Use Default Restday</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <label className="text-gray-700 text-sm ml-4">Restday With Workshift</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                defaultChecked
                className={checkboxClass}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">Default Restday 1</label>
              {isEditMode ? (
                <select
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">Default Restday 2</label>
              {isEditMode ? (
                <select
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">Default Restday 3</label>
              {isEditMode ? (
                <select
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              )}
            </div>
          </div>

          {/* Brackets Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700 text-sm">Use Tardiness Bracket</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="text"
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              <label className="text-gray-700 text-sm ml-8">Deduct 1st Half Leave Before Bracket</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                className={checkboxClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700 text-sm">Use Undertime Bracket</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="text"
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              <label className="text-gray-700 text-sm ml-8">Deduct 2nd Half Leave Before Bracket</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                className={checkboxClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700 text-sm">Use Accumulation Bracket</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="text"
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-8 ml-12">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                <span className="text-gray-700">Accumulate Tardiness</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                <span className="text-gray-700">Accumulate Undertime</span>
              </label>
            </div>
          </div>

          {/* Compute Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-64 text-gray-700 text-sm">Compute Undertime to Absences</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                defaultChecked
                className={checkboxClass}
              />
              <input
                type="text"
                defaultValue="3.00"
                readOnly={!isEditMode}
                className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              <span className="text-gray-500 text-sm">hh.hh</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-64 text-gray-700 text-sm">Compute Tardiness to Absences</label>
              <input
                type="checkbox"
                disabled={!isEditMode}
                defaultChecked
                className={checkboxClass}
              />
              <input
                type="text"
                defaultValue="4.00"
                readOnly={!isEditMode}
                className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              <span className="text-gray-500 text-sm">hh.hh</span>
            </div>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">Compute No Of Hours Even Without Logs</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">Compute Absences in Middle of Cut off Dates</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">Compute No Of Hours For Rest Day</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">Compute No Of Hours For Legal</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">Compute No Of Hours For Special</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">Compute No Of Hours For Non-Working Holiday</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">No Absences before Date Hired</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>
          </div>

          {/* Calamity2 Allowance Policy - Separate Division */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-4">Calamity2 Allowance Policy</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm">Years of Service</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm">Min Hrs for Allowance</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.hh]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm">Allowance Amount</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm">Allowance Code</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Allowance Per Classification Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="w-48 text-gray-700 text-sm">Allowance Per Classification</label>
              <input
                type="text"
                readOnly={!isEditMode}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              <span className="text-gray-700">Enable Classification in Allowance Per Classification Computation</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="w-48 text-gray-700 text-sm">Allowance Bracket Code</label>
              <input
                type="text"
                defaultValue="ALLOW1"
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              <span className="text-gray-700">By Employment Status</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="w-48 text-gray-700 text-sm">Allowance by Status</label>
              <input
                type="text"
                readOnly={!isEditMode}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Exemptions */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Exemptions</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Tardiness</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Undertime</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Night Differential</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Overtime</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Absences</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Other Earnings and Allowance</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Holiday Pay</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Unpaid Work on holiday</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
            </div>
          </div>

          {/* Leave/Absences Exemption */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Leave/Absences Exemption</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Apply Leave For First Half</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Apply Leave For Second Half</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked />
              </label>
            </div>
          </div>

          {/* Birthday Leave */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Birthday Leave</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-32">Birthday Leave</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm">Daily Schedule</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Exclude Suspension */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Exclude Suspension</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Rest Day</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Legal Holiday</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Special Holiday</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Non-Working Holiday</span>
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}