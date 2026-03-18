import { Upload, X, Pencil, Save, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Footer } from "../../Footer/Footer";
import apiClient from "../../../services/apiClient";
import auditTrail from '../../../services/auditTrail';
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";

const formName = 'Company Information SetUp';

interface CompanyInformationProps {
  onBack?: () => void;
}

interface CompanyData {
  companyID: number;
  companyCode: string;
  companyName: string;
  companyLogo: string | null;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  telNo: string;
  email: string;
  sssNo: string;
  philHealthNo: string;
  pag_Ibig: string;
  tin: string;
  biR_BRNCode: string;
  busFr: string;
  busTo: string;
  timeInTimeOutScreen: boolean | null;
  militaryTime: boolean | null;
  decPlaces: number | null;
  webLogo: string | null;
  webLogoType: string | null;
  webLogoReports: string | null;
  webLogoReportsType: string | null;
  line1: string | null;
  line2: string | null;
  head: string | null;
  chartAcct: string | null;
  payrollPath: string;
  hrisPath: string;
  otPremiumFlag: boolean;
  terminalID: boolean;
  validateLogs: boolean;
  readOnlyTxtDate: boolean;
  policy: string;
  flag: boolean;
  gsisNo: string;
  exportEmail: boolean;
  siteLogo: string | null;
  siteContent: string | null;
  passwordHistory: boolean;
  tksPhotoPath: string;
  exportLateFilingDateFlag: boolean;
  enableAutoPairingLogsFlag: boolean;
  enableAppOTRawDataFlag: boolean;
  enable2ndShiftRawDataFlag: boolean;
  serverName: string | null;
  maxNoOfCompanies: string | null;
  maxNoOfEmployees: string | null;
  registeredDatabase: string | null;
}

interface CompanyConfigData {
  id: number;
  numberOfAttempts: number;
  numberOfSeconds: number;
  passwordAge: number;
}

export function CompanyInformation({ onBack }: CompanyInformationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [formData, setFormData] = useState<CompanyData | null>(null);
  const [configData, setConfigData] = useState<CompanyConfigData | null>(null);
  const [configForm, setConfigForm] = useState<CompanyConfigData | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const hasPermission = (accessType: string) => permissions[accessType] === true;

  useEffect(() => {
    getCompanyInformationSetUpPermissions();
  }, []);

  const getCompanyInformationSetUpPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;
    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];
      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "CompanyInformationSetUp",
      );
      const permMap: Record<string, boolean> = {};
      branchEntries.forEach((p) => {
        const accessType = decryptData(p.accessTypeName);
        if (accessType) permMap[accessType] = true;
      });
      setPermissions(permMap);
    } catch (e) {
      console.error("Error parsing or decrypting payload", e);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [companyRes, configRes] = await Promise.all([
        apiClient.get("/Fs/System/CompanyInformation"),
        apiClient.get("/Fs/System/CompanyInformation/Config"),
      ]);

      if (companyRes.status === 200 && companyRes.data) {
        const data = Array.isArray(companyRes.data)
          ? companyRes.data[0]
          : companyRes.data;
        setCompanyData(data);
        setFormData(data);
      }

      if (configRes.status === 200 && configRes.data) {
        const cfg = Array.isArray(configRes.data)
          ? configRes.data[0]
          : configRes.data;
        setConfigData(cfg);
        setConfigForm(cfg);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load company information";
      await Swal.fire({ icon: "error", title: "Error", text: errorMsg });
      console.error("Error fetching company information:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Accept source param — used for both Edit and Save validation
  const validateCompanyPaths = async (): Promise<boolean> => {
  try {
    // ✅ Always fetch fresh data from API in real-time
    const res = await apiClient.get("/Fs/System/CompanyInformation");
    const freshData = Array.isArray(res.data) ? res.data[0] : res.data;

    if (!freshData) return true;

    const hrisPath = (freshData.hrisPath ?? "").trim();
    const payrollPath = (freshData.payrollPath ?? "").trim();

    if (hrisPath !== "") {
      await Swal.fire({
        icon: "error",
        title: "Not Allowed",
        text: "You are connected to HRIS. You are not allowed to do any transaction for this setup.",
      });
      return false;
    }

    if (payrollPath !== "") {
      await Swal.fire({
        icon: "error",
        title: "Not Allowed",
        text: "You are connected to Payroll. You are not allowed to do any transaction for this setup.",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to fetch company paths for validation:", error);
    // ✅ If fetch fails, allow the action to proceed
    return true;
  }
};

  // ✅ On Edit — validate original DB data
const handleEdit = async () => {
  const allowed = await validateCompanyPaths();
  if (!allowed) return;
  setIsEditing(true);
};

  const handleSave = async () => {
    if (!formData) return;
  const allowed = await validateCompanyPaths();
  if (!allowed) return;

  try {
      setLoading(true);

      const payload = {
        companyID:                  formData.companyID,
        companyCode:                formData.companyCode,
        companyName:                formData.companyName,
        companyLogo:                formData.companyLogo,
        address:                    formData.address,
        city:                       formData.city,
        province:                   formData.province,
        zipCode:                    formData.zipCode,
        telNo:                      formData.telNo,
        email:                      formData.email,
        sssNo:                      formData.sssNo,
        philHealthNo:               formData.philHealthNo,
        pag_Ibig:                   formData.pag_Ibig,
        tin:                        formData.tin,
        biR_BRNCode:                formData.biR_BRNCode,
        busFr:                      formData.busFr,
        busTo:                      formData.busTo,
        timeInTimeOutScreen:        formData.timeInTimeOutScreen,
        militaryTime:               formData.militaryTime,
        decPlaces:                  formData.decPlaces,
        webLogo:                    formData.webLogo,
        webLogoType:                formData.webLogoType,
        webLogoReports:             formData.webLogoReports,
        webLogoReportsType:         formData.webLogoReportsType,
        line1:                      formData.line1,
        line2:                      formData.line2,
        head:                       formData.head,
        chartAcct:                  formData.chartAcct,
        payrollPath:                formData.payrollPath,
        hrisPath:                   formData.hrisPath,
        otPremiumFlag:              formData.otPremiumFlag,
        terminalID:                 formData.terminalID,
        validateLogs:               formData.validateLogs,
        readOnlyTxtDate:            formData.readOnlyTxtDate,
        policy:                     formData.policy,
        flag:                       formData.flag,
        gsisNo:                     formData.gsisNo,
        exportEmail:                formData.exportEmail,
        siteLogo:                   formData.siteLogo,
        siteContent:                formData.siteContent,
        passwordHistory:            formData.passwordHistory,
        tksPhotoPath:               formData.tksPhotoPath,
        exportLateFilingDateFlag:   formData.exportLateFilingDateFlag,
        enableAutoPairingLogsFlag:  formData.enableAutoPairingLogsFlag,
        enableAppOTRawDataFlag:     formData.enableAppOTRawDataFlag,
        enable2ndShiftRawDataFlag:  formData.enable2ndShiftRawDataFlag,
      };

      const [companyResult, configResult] = await Promise.allSettled([
        apiClient.put(`/Fs/System/CompanyInformation/${formData.companyID}`, payload),
        configForm
          ? apiClient.put(`/Fs/System/CompanyInformation/Config/${configForm.id}`, {
              id:               configForm.id,
              numberOfAttempts: configForm.numberOfAttempts,
              numberOfSeconds:  configForm.numberOfSeconds,
              passwordAge:      configForm.passwordAge,
            })
          : Promise.resolve(null),
      ]);

      if (companyResult.status === "rejected") {
        const err = companyResult.reason;
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save company information";
        await Swal.fire({ icon: "error", title: "Company Save Failed", text: errorMsg });
        return;
      }

      const companyRes = companyResult.value;
      if (companyRes && companyRes.status === 200) {
        const updatedData = Array.isArray(companyRes.data)
          ? companyRes.data[0]
          : companyRes.data;
        setCompanyData(updatedData);
        setFormData(updatedData);
      }

      if (configResult.status === "rejected") {
        const err = configResult.reason;
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save config information";
        await Swal.fire({ icon: "error", title: "Config Save Failed", text: errorMsg });
        return;
      }

      if (configResult.status === "fulfilled" && configResult.value) {
        const configRes = configResult.value;
        if (configRes.status === 200 || configRes.status === 201) {
          const updatedCfg = Array.isArray(configRes.data)
            ? configRes.data[0]
            : configRes.data;
          setConfigData(updatedCfg);
          setConfigForm(updatedCfg);
        }
      }

      setIsEditing(false);

      await auditTrail.log({
        accessType: "Edit",
        trans: "Updated company information",
        messages: `Company information updated: ${JSON.stringify(
          companyResult.status === "fulfilled" ? companyResult.value?.data : {},
        )}`,
        formName: formName,
      });

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Company information updated successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save changes";
      await Swal.fire({ icon: "error", title: "Error", text: errorMsg });
      console.error("Error updating company information:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(companyData);
    setConfigForm(configData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof CompanyData, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleConfigChange = (field: keyof CompanyConfigData, value: any) => {
    if (configForm) {
      setConfigForm({ ...configForm, [field]: value });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => handleInputChange("companyLogo", reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLogoRemove = () => handleInputChange("companyLogo", null);

  const handleSiteLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => handleInputChange("siteLogo", reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSiteLogoRemove = () => handleInputChange("siteLogo", null);

  const handleSiteContentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => handleInputChange("siteContent", reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSiteContentRemove = () => handleInputChange("siteContent", null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  if (loading && !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading company information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Company Information</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Configure essential company details including identification numbers, addresses,
                    contact information, database paths, and system policies. Upload company and site
                    logos to customize the application appearance.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      "Company registration details",
                      "Government ID numbers",
                      "Database path configuration",
                      "Logo and branding management",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {hasPermission("View") ? (
              <div className="grid grid-cols-12 gap-6 p-6 pt-0">

                {/* Left Sidebar – Company Logo */}
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="aspect-square bg-white border-2 border-dashed border-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {formData?.companyLogo ? (
                        <img
                          src={formData.companyLogo}
                          alt="Company Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm text-center px-2">
                          Company Logo
                        </span>
                      )}
                    </div>
                    <input
                      id="company-logo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!isEditing}
                      onChange={handleLogoUpload}
                    />
                    <label
                      htmlFor="company-logo-input"
                      className={`block w-full px-4 py-2 bg-gray-200 text-gray-700 text-center rounded transition-colors mb-2 ${
                        isEditing ? "cursor-pointer hover:bg-gray-300" : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      Choose File
                    </label>
                    <div className="flex gap-2">
                      <label
                        htmlFor="company-logo-input"
                        className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded transition-colors flex items-center justify-center gap-2 ${
                          isEditing
                            ? "cursor-pointer hover:bg-blue-600"
                            : "opacity-50 cursor-not-allowed pointer-events-none"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </label>
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                        onClick={handleLogoRemove}
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-span-9 space-y-6">

                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-gray-700">Code</label>
                        <div className="flex gap-2">
                          {hasPermission("Edit") && (
                            <>
                              <button
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm ${
                                  isEditing
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-600 text-white hover:bg-gray-700"
                                }`}
                                onClick={isEditing ? handleSave : handleEdit}
                                disabled={loading}
                              >
                                {isEditing ? (
                                  <><Save className="w-4 h-4" />Save</>
                                ) : (
                                  <><Pencil className="w-4 h-4" />Edit</>
                                )}
                              </button>
                              {isEditing && (
                                <button
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                                  onClick={handleCancel}
                                  disabled={loading}
                                >
                                  <X className="w-4 h-4" />Cancel
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData?.companyCode || ""}
                        onChange={(e) => handleInputChange("companyCode", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData?.companyName || ""}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData?.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData?.city || ""}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Province</label>
                      <input
                        type="text"
                        value={formData?.province || ""}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={formData?.zipCode || ""}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Two Column Section */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {[
                        { label: "SSS No.", field: "sssNo" as keyof CompanyData },
                        { label: "Philhealth No", field: "philHealthNo" as keyof CompanyData },
                        { label: "Pagibig No :", field: "pag_Ibig" as keyof CompanyData },
                        { label: "Tin No :", field: "tin" as keyof CompanyData },
                        { label: "Branch Code (BIR) :", field: "biR_BRNCode" as keyof CompanyData },
                        { label: "GSIS No.", field: "gsisNo" as keyof CompanyData },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="block text-gray-700 mb-2">{label}</label>
                          <input
                            type="text"
                            value={(formData?.[field] as string) || ""}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly={!isEditing}
                          />
                        </div>
                      ))}

                      <div>
                        <label className="block text-gray-700 mb-2">Business Cycle From</label>
                        <input
                          type="text"
                          value={formData?.busFr ? formatDate(formData.busFr) : ""}
                          onChange={(e) => handleInputChange("busFr", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Business Cycle To</label>
                        <input
                          type="text"
                          value={formData?.busTo ? formatDate(formData.busTo) : ""}
                          onChange={(e) => handleInputChange("busTo", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Telephone</label>
                        <input
                          type="text"
                          value={formData?.telNo || ""}
                          onChange={(e) => handleInputChange("telNo", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData?.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>

                     {/* Hrs Database Path */}
<div>
  <label className="block text-gray-700 mb-2">Hrs Database Path:</label>
  <input
    type="text"
    value={formData?.hrisPath || ""}
    onChange={(e) => handleInputChange("hrisPath", e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    readOnly={!isEditing}
  />
</div>

{/* Payroll Database Path */}
<div>
  <label className="block text-gray-700 mb-2">Payroll Database Path:</label>
  <input
    type="text"
    value={formData?.payrollPath || ""}
    onChange={(e) => handleInputChange("payrollPath", e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    readOnly={!isEditing}
  />
</div>

                      <div>
                        <label className="block text-gray-700 mb-2">TKS Photo Path:</label>
                        <input
                          type="text"
                          value={formData?.tksPhotoPath || ""}
                          onChange={(e) => handleInputChange("tksPhotoPath", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-2">
                        {[
                          { label: "Use OT Premium Breakdown",     field: "otPremiumFlag" as keyof CompanyData },
                          { label: "With Terminal",                field: "terminalID" as keyof CompanyData },
                          { label: "Logs Validate",                field: "validateLogs" as keyof CompanyData },
                          { label: "Read Only Textbox Date",       field: "readOnlyTxtDate" as keyof CompanyData },
                          { label: "Export with Sending Email",    field: "exportEmail" as keyof CompanyData },
                          { label: "Export Late Filing Date",      field: "exportLateFilingDateFlag" as keyof CompanyData },
                          { label: "Enable Auto Pairing Logs",     field: "enableAutoPairingLogsFlag" as keyof CompanyData },
                          { label: "Enable Approved OT",           field: "enableAppOTRawDataFlag" as keyof CompanyData },
                          { label: "Enable 2nd Shift in Raw Data", field: "enable2ndShiftRawDataFlag" as keyof CompanyData },
                        ].map(({ label, field }) => (
                          <label key={field} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={(formData?.[field] as boolean) || false}
                              onChange={(e) => handleInputChange(field, e.target.checked)}
                              disabled={!isEditing}
                            />
                            <span className="text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Company Config & License Policy */}
                  <div className="grid grid-cols-2 gap-6">

                    {/* Company Config */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <h3 className="text-gray-800 mb-4">Company Config</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Number of Attempts</label>
                          <input
                            type="number"
                            value={configForm?.numberOfAttempts ?? ""}
                            onChange={(e) =>
                              handleConfigChange("numberOfAttempts",
                                e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly={!isEditing}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Policy</label>
                          <input
                            type="text"
                            value={formData?.policy || ""}
                            onChange={(e) => handleInputChange("policy", e.target.value)}
                            className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly={!isEditing}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Password Age</label>
                          <input
                            type="number"
                            value={configForm?.passwordAge ?? ""}
                            onChange={(e) =>
                              handleConfigChange("passwordAge",
                                e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly={!isEditing}
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={formData?.passwordHistory || false}
                            onChange={(e) => handleInputChange("passwordHistory", e.target.checked)}
                            disabled={!isEditing}
                          />
                          <span className="text-gray-700 text-sm">Enforce Password History</span>
                        </label>
                      </div>
                    </div>

                    {/* License Policy — always read-only */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <h3 className="text-gray-800 mb-4">License Policy</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Server Name:</label>
                          <input
                            type="text"
                            value={formData?.serverName ?? ""}
                            className="w-40 px-3 py-1 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                            readOnly
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Max No Companies:</label>
                          <input
                            type="text"
                            value={formData?.maxNoOfCompanies ?? ""}
                            className="w-40 px-3 py-1 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                            readOnly
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Max No Employees:</label>
                          <input
                            type="text"
                            value={formData?.maxNoOfEmployees ?? ""}
                            className="w-40 px-3 py-1 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                            readOnly
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Registered Database:</label>
                          <input
                            type="text"
                            value={formData?.registeredDatabase ?? ""}
                            className="w-40 px-3 py-1 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Site Logo & Site Content */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Site Logo */}
                    <div>
                      <label className="block text-gray-700 mb-2">Site Logo :</label>
                      {formData?.siteLogo && (
                        <div className="mb-2 w-full h-24 border border-gray-200 rounded overflow-hidden flex items-center justify-center bg-white">
                          <img src={formData.siteLogo} alt="Site Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <input
                        id="site-logo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!isEditing}
                        onChange={handleSiteLogoUpload}
                      />
                      <label
                        htmlFor="site-logo-input"
                        className={`block w-full px-4 py-2 bg-gray-200 text-gray-700 text-center rounded transition-colors mb-2 ${
                          isEditing ? "cursor-pointer hover:bg-gray-300" : "cursor-not-allowed opacity-50"
                        }`}
                      >
                        Choose File
                      </label>
                      <div className="flex gap-2">
                        <label
                          htmlFor="site-logo-input"
                          className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded transition-colors flex items-center justify-center gap-2 ${
                            isEditing ? "cursor-pointer hover:bg-blue-600" : "opacity-50 cursor-not-allowed pointer-events-none"
                          }`}
                        >
                          <Upload className="w-4 h-4" />Upload
                        </label>
                        <button
                          type="button"
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isEditing}
                          onClick={handleSiteLogoRemove}
                        >
                          <X className="w-4 h-4" />Remove
                        </button>
                      </div>
                    </div>

                    {/* Site Content */}
                    <div>
                      <label className="block text-gray-700 mb-2">Site Content :</label>
                      {formData?.siteContent && (
                        <div className="mb-2 w-full h-24 border border-gray-200 rounded overflow-hidden flex items-center justify-center bg-white">
                          <img src={formData.siteContent} alt="Site Content" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <input
                        id="site-content-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!isEditing}
                        onChange={handleSiteContentUpload}
                      />
                      <label
                        htmlFor="site-content-input"
                        className={`block w-full px-4 py-2 bg-gray-200 text-gray-700 text-center rounded transition-colors mb-2 ${
                          isEditing ? "cursor-pointer hover:bg-gray-300" : "cursor-not-allowed opacity-50"
                        }`}
                      >
                        Choose File
                      </label>
                      <div className="flex gap-2">
                        <label
                          htmlFor="site-content-input"
                          className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded transition-colors flex items-center justify-center gap-2 ${
                            isEditing ? "cursor-pointer hover:bg-blue-600" : "opacity-50 cursor-not-allowed pointer-events-none"
                          }`}
                        >
                          <Upload className="w-4 h-4" />Upload
                        </label>
                        <button
                          type="button"
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isEditing}
                          onClick={handleSiteContentRemove}
                        >
                          <X className="w-4 h-4" />Remove
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                You do not have permission to view this list.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}