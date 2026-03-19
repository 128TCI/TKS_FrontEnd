import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, X, Plus, Pencil, Check, Search, Trash2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

interface EmailTemplateItem {
  id: number;
  code: string;
  mailSubject: string;
  mailMessage: string;
  isDefault: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Bar
// ─────────────────────────────────────────────────────────────────────────────

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (currentPage > 3) pages.push('...');
  const start = Math.max(2, currentPage - 1);
  const end   = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

function PaginationBar({
  currentPage, totalPages, setPage, startIdx, endIdx, total,
}: {
  currentPage: number; totalPages: number; setPage: (p: number) => void;
  startIdx: number; endIdx: number; total: number;
}) {
  return (
    <div className="flex items-center justify-between mt-3">
      <div className="text-gray-600 text-xs">
        Showing {total === 0 ? 0 : startIdx + 1} to {Math.min(endIdx, total)} of {total} entries
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        {getPageNumbers(currentPage, totalPages).map((page, idx) =>
          page === '...'
            ? <span key={`e${idx}`} className="px-1 text-gray-500 text-xs self-center">...</span>
            : <button key={`p${page}`} type="button" onClick={() => setPage(page as number)}
                className={`px-2 py-1 rounded text-xs ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                {page}
              </button>
        )}
        <button type="button" onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared input styles — matches EmpClassSearchModal density
// ─────────────────────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
const selectCls = `${inputCls} bg-white cursor-pointer`;
const labelCls  = 'block text-sm text-gray-700 mb-1';

// ─────────────────────────────────────────────────────────────────────────────
// ModalShell — EmpClassSearchModal design language
// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  wide,
  children,
  footer,
  zIndex = 50,
  blockEsc = false,
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  zIndex?: number;
  blockEsc?: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !blockEsc) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, blockEsc]);

  const maxW = wide ? 'max-w-3xl' : 'max-w-2xl';

  return createPortal(
    <>
      {/* Backdrop */}
      <div style={{ zIndex }} className="fixed inset-0 bg-black/50" onClick={onClose} />
      {/* Modal */}
      <div style={{ zIndex: zIndex + 1 }} className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[95vh] overflow-y-auto pointer-events-auto`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header — sticky, matches EmpClassSearchModal */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
            <h2 className="text-gray-800 text-sm font-medium">{title}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 rounded-b-2xl sticky bottom-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL 3 — Create / Edit Email Template Form
// ─────────────────────────────────────────────────────────────────────────────

function EmailTemplateFormModal({
  mode, initial, onClose, onSaved,
}: {
  mode: 'create' | 'edit';
  initial?: EmailTemplateItem;
  onClose: () => void;
  onSaved: (item: EmailTemplateItem) => void;
}) {
  const [code,       setCode]       = useState(initial?.code        ?? '');
  const [subject,    setSubject]    = useState(initial?.mailSubject ?? '');
  const [message,    setMessage]    = useState(initial?.mailMessage ?? '');
  const [isDefault,  setIsDefault]  = useState(initial?.isDefault   ?? false);
  const [submitting, setSubmitting] = useState(false);

  const vars = [
    { label: 'Employee Name',          tag: '[NAME]'     },
    { label: 'Date From',              tag: '[DATEFROM]' },
    { label: 'Date To',                tag: '[DATETO]'   },
    { label: 'Department Code',        tag: '[DEPTCODE]' },
    { label: 'Department Description', tag: '[DEPTDESC]' },
  ];

  // ── Save (Create or Update) ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!code.trim() || !subject.trim() || !message.trim()) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Code, Subject, and Message are required.', timer: 2000, showConfirmButton: true });
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ID: initial?.id ?? 0, Code: code, MailSubject: subject, MailMessage: message, IsDefault: isDefault };

      if (mode === 'create') {
        const res = await apiClient.post('/EmailTemplate', payload);
        const saved: EmailTemplateItem = {
          id: res.data?.id ?? res.data?.ID ?? Date.now(),
          code: res.data?.code ?? code,
          mailSubject: res.data?.mailSubject ?? subject,
          mailMessage: res.data?.mailMessage ?? message,
          isDefault:   res.data?.isDefault   ?? isDefault,
        };
        await Swal.fire({ icon: 'success', title: 'Created', text: 'Template created successfully.', timer: 1800, showConfirmButton: false });
        onSaved(saved);
      } else {
        const res = await apiClient.put(`/EmailTemplate/${initial!.id}`, { ...payload, ID: initial!.id });
        const saved: EmailTemplateItem = {
          id:          initial!.id,
          code:        res.data?.code        ?? code,
          mailSubject: res.data?.mailSubject ?? subject,
          mailMessage: res.data?.mailMessage ?? message,
          isDefault:   res.data?.isDefault   ?? isDefault,
        };
        await Swal.fire({ icon: 'success', title: 'Updated', text: 'Template updated successfully.', timer: 1800, showConfirmButton: false });
        onSaved(saved);
      }
      onClose();
    } catch (err) {
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save template.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={mode === 'create' ? 'Create Email Template' : `Edit Template: ${initial?.code}`}
      onClose={onClose}
      zIndex={300}
      footer={
        <>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
            {submitting ? 'Saving…' : 'Submit'}
          </button>
          <button type="button" onClick={onClose}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
              Back to List
          </button>          
        </>
      }
    >
      <h3 className="text-blue-600 mb-3 text-sm">
        {mode === 'create' ? 'New Email Template' : 'Edit Email Template'}
      </h3>

      <div className="flex gap-5">
        {/* Left — fields */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <label className={labelCls}>Template Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              maxLength={10}
              value={code}
              onChange={e => setCode(e.target.value)}
              readOnly={mode === 'edit'}
              placeholder="e.g. LEAVE_01"
              className={`${inputCls} w-40 ${mode === 'edit' ? 'bg-gray-50 cursor-not-allowed text-gray-400' : ''}`}
            />
            <p className="text-xs text-gray-400 mt-1">Max 10 characters. Cannot be changed after creation.</p>
          </div>

          <div>
            <label className={labelCls}>Mail Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter email subject line…"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Mail Message <span className="text-red-500">*</span></label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={8}
              placeholder="Enter the email body. Use variable tags from the panel on the right…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Is Default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Set as Default</span>
            <span className="text-xs text-gray-400">— pre-selected when composing emails</span>
          </label>
        </div>

        {/* Right — variables */}
        <div className="w-40 flex-shrink-0">
          <p className="text-xs text-gray-500 font-medium mb-2">Variables</p>
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-2 py-1.5 text-left text-gray-600">Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vars.map(v => (
                  <tr key={v.tag} className="hover:bg-blue-50">
                    <td className="px-2 py-1.5">
                      <p className="text-gray-500 text-xs mb-0.5">{v.label}</p>
                      <code className="text-blue-600 font-mono text-xs">{v.tag}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">Paste any tag into your message body.</p>
        </div>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL 2 — Email Template List
// ─────────────────────────────────────────────────────────────────────────────

function EmailTemplateModal({
  onClose, onSelectTemplate,
}: {
  onClose: () => void;
  onSelectTemplate: (code: string) => void;
}) {
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [subModal,  setSubModal]  = useState<null | 'create' | EmailTemplateItem>(null);

  const itemsPerPage = 10;

  // ── Fetch all templates from API ──────────────────────────────────────────
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/EmailTemplate');
      const list = Array.isArray(res.data) ? res.data : [];
      setTemplates(list.map((t: any): EmailTemplateItem => ({
        id:          t.id          ?? t.ID          ?? 0,
        code:        t.code        ?? t.Code        ?? '',
        mailSubject: t.mailSubject ?? t.MailSubject ?? '',
        mailMessage: t.mailMessage ?? t.MailMessage ?? '',
        isDefault:   t.isDefault   ?? t.IsDefault   ?? false,
      })));
    } catch (e) {
      console.error('Failed to load email templates', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);

  const filtered   = templates.filter(t =>
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.mailSubject.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx   = (page - 1) * itemsPerPage;
  const endIdx     = Math.min(startIdx + itemsPerPage, filtered.length);
  const paginated  = filtered.slice(startIdx, endIdx);

  // ── Update list after save ────────────────────────────────────────────────
  const handleSaved = (saved: EmailTemplateItem) =>
    setTemplates(prev => {
      const exists = prev.find(t => t.id === saved.id);
      return exists ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved];
    });

  // ── Remove from list after delete ─────────────────────────────────────────
  const handleDeleted = (id: number) =>
    setTemplates(prev => prev.filter(t => t.id !== id));

  return (
    <>
      {subModal === null && (
        <ModalShell
          title="Email Templates"
          onClose={onClose}
          wide
          zIndex={200}
          footer={
            <button type="button" onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Close
            </button>
          }
        >
          <h3 className="text-blue-600 mb-3 text-sm">Select or manage your message templates</h3>

          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm text-gray-700">Search:</label>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Search templates…"
            />
            <button
              type="button"
              onClick={() => setSubModal('create')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />Create Template
            </button>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm w-28">Code</th>
                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Mail Subject</th>
                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Mail Message</th>
                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm w-24">Default</th>
                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-sm">Loading templates…</td></tr>
                ) : paginated.length > 0 ? paginated.map(t => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => { onSelectTemplate(t.code); onClose(); }}
                  >
                    <td className="px-3 py-1.5 font-mono text-xs text-gray-700">{t.code}</td>
                    <td className="px-3 py-1.5 text-gray-700">{t.mailSubject}</td>
                    <td className="px-3 py-1.5 text-gray-500 text-xs max-w-xs">
                      <span className="line-clamp-2">{t.mailMessage || '—'}</span>
                    </td>
                    <td className="px-3 py-1.5">
                      {t.isDefault
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs border border-green-200">
                            <Check className="w-3 h-3" />Default
                          </span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSubModal(t)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirm = await Swal.fire({
                              icon: 'warning', title: 'Confirm Delete',
                              text: `Are you sure you want to delete template "${t.code}"?`,
                              showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
                              confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
                            });
                            if (!confirm.isConfirmed) return;
                            try {
                              await apiClient.delete(`/EmailTemplate/${t.id}`);
                              await Swal.fire({ icon: 'success', title: 'Deleted', text: 'Template deleted successfully.', timer: 1800, showConfirmButton: false });
                              handleDeleted(t.id);
                            } catch {
                              await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete template.' });
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500 text-sm">
                      No templates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <PaginationBar currentPage={page} totalPages={totalPages} setPage={setPage}
              startIdx={startIdx} endIdx={endIdx} total={filtered.length} />
          )}
        </ModalShell>
      )}

      {subModal === 'create' && (
        <EmailTemplateFormModal
          mode="create"
          onClose={() => setSubModal(null)}
          onSaved={handleSaved}
        />
      )}

      {subModal !== null && subModal !== 'create' && (
        <EmailTemplateFormModal
          mode="edit"
          initial={subModal as EmailTemplateItem}
          onClose={() => setSubModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interface — matches EmailConfigurationPage
// ─────────────────────────────────────────────────────────────────────────────

interface EmailConfiguration {
  id: number;
  username: string;
  emailSender: string;
  password: string;
  smtpServer: string;
  sendOption: string;
  port: string;
  targetName: string;
  encryptionConnection: string;
}

const DEFAULT_CONFIG: EmailConfiguration = {
  id: 0,
  username: '',
  emailSender: '',
  password: '',
  smtpServer: '',
  sendOption: '',
  port: '587',
  targetName: '',
  encryptionConnection: 'None',
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL 1 — Email Configuration (SMTP settings)   ← exported
// ─────────────────────────────────────────────────────────────────────────────

export function EmailConfigurationModal({
  isOpen, onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [config,            setConfig]            = useState<EmailConfiguration>(DEFAULT_CONFIG);
  const [confirmPassword,   setConfirmPassword]   = useState('');
  const [emailTypeCode,     setEmailTypeCode]     = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [isSaving,          setIsSaving]          = useState(false);
  const [isTesting,         setIsTesting]         = useState(false);
  const originalConfig = useRef<EmailConfiguration | null>(null);

  // ── Fetch on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/Security/EmailConfiguration/128TCI');
        if (res.data) {
          originalConfig.current = res.data;
          setConfig(res.data);
          setConfirmPassword(res.data.password ?? '');
        }
      } catch (err) {
        console.error('Failed to load email configuration:', err);
        await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load email configuration.', timer: 2000, showConfirmButton: false });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (config.password && config.password !== confirmPassword) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Passwords do not match.', timer: 2000, showConfirmButton: false });
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        Id:                   config.id,
        Username:             config.username,
        EmailSender:          config.emailSender,
        Password:             config.password,
        SmtpServer:           config.smtpServer,
        SendOption:           config.sendOption,
        Port:                 config.port,
        TargetName:           config.targetName,
        EncryptionConnection: config.encryptionConnection,
      };
      const res = await apiClient.put(`/Security/EmailConfiguration/Update/${config.username}`, payload);
      if (res.status >= 200 && res.status < 300) {
        originalConfig.current = config;
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'Email configuration saved successfully!', timer: 1800, showConfirmButton: false });
        onClose();
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save email configuration.' });
      }
    } catch (err) {
      console.error('Save error:', err);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save email configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalConfig.current) {
      setConfig(originalConfig.current);
      setConfirmPassword(originalConfig.current.password ?? '');
    }
    onClose();
  };

  const handleTestEmail = async () => {
    try {
      setIsTesting(true);
      const payload = {
        toEmail: config.emailSender,
        subject: 'Test Email Configuration',
        body:    'This is a test email to verify your email configuration is working correctly.',
      };
      const res = await apiClient.post('/Security/EmailConfiguration/Test', payload);
      if (res.status >= 200 && res.status < 300) {
        await Swal.fire({ icon: 'success', title: 'Test Sent', text: `Test email sent successfully to ${config.emailSender}!`, timer: 2000, showConfirmButton: false });
      } else {
        await Swal.fire({ icon: 'error', title: 'Failed', text: `Failed to send test email to ${config.emailSender}.` });
      }
    } catch {
      await Swal.fire({ icon: 'error', title: 'Failed', text: `Failed to send test email to ${config.emailSender}.` });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalShell
        title="Email Configuration"
        onClose={handleCancel}
        wide
        zIndex={100}
        blockEsc={showTemplateModal}
        footer={
          <>
            {/*<button type="button" onClick={handleTestEmail} disabled={isTesting || loading}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed mr-auto">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              {isTesting ? 'Sending…' : 'Test Email'}
            </button>*/}
            <button onClick={handleSave} disabled={isSaving || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
              {isSaving ? 'Saving…' : 'Submit'}
            </button>
            <button onClick={handleCancel}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
              Back to List
            </button>            
          </>
        }
      >
        <h3 className="text-blue-600 mb-3 text-sm">Configure SMTP settings and email template</h3>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Loading configuration…</div>
        ) : (
          <div className="space-y-4">

            {/* ── Email Template ── */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-3 py-1.5">
                <span className="text-gray-700 text-sm font-medium">Email Template</span>
              </div>
              <div className="p-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className={labelCls}>Selected Template</label>
                    <input
                      type="text"
                      value={emailTypeCode}
                      readOnly
                      placeholder="No template selected — browse to choose one"
                      className={`${inputCls} bg-gray-50 cursor-not-allowed text-gray-400`}
                    />
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button type="button" onClick={() => setShowTemplateModal(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />Browse Templates
                    </button>
                    {emailTypeCode && (
                      <button type="button" onClick={() => setEmailTypeCode('')} title="Clear selection"
                        className="p-1.5 border border-gray-300 rounded hover:bg-red-50 hover:border-red-200 transition-colors group">
                        <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sender & Server ── */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-3 py-1.5">
                <span className="text-gray-700 text-sm font-medium">Sender &amp; Server</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Email Sender <span className="text-red-500">*</span></label>
                  <input type="email" name="emailSender" value={config.emailSender} onChange={handleChange}
                    placeholder="sender@company.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>SMTP Server <span className="text-red-500">*</span></label>
                  <input name="smtpServer" value={config.smtpServer} onChange={handleChange}
                    placeholder="smtp.company.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Send Option</label>
                  <select name="sendOption" value={config.sendOption} onChange={handleChange} className={selectCls}>
                    <option value="">— Select option —</option>
                    <option value="Others">Others</option>
                    <option value="Gmail">Gmail</option>
                    <option value="Outlook">Outlook</option>
                    <option value="Yahoo">Yahoo</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Port</label>
                  <input name="port" value={config.port} onChange={handleChange}
                    placeholder="e.g. 587" className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Security ── */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-3 py-1.5">
                <span className="text-gray-700 text-sm font-medium">Security</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Username</label>
                  <input name="username" value={config.username} onChange={handleChange}
                    placeholder="SMTP username" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Target Name</label>
                  <input name="targetName" value={config.targetName} onChange={handleChange}
                    placeholder="Optional target name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password <span className="text-red-500">*</span></label>
                  <input type="password" name="password" value={config.password} onChange={handleChange}
                    placeholder="Enter password" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password <span className="text-red-500">*</span></label>
                  <input type="password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Encryption Connection</label>
                  <select name="encryptionConnection" value={config.encryptionConnection} onChange={handleChange} className={selectCls}>
                    <option value="None">None</option>
                    <option value="SSL">SSL</option>
                    <option value="TLS">TLS</option>
                    <option value="STARTTLS">STARTTLS</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}
      </ModalShell>

      {showTemplateModal && (
        <EmailTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={code => { setEmailTypeCode(code); setShowTemplateModal(false); }}
        />
      )}
    </>
  );
}
