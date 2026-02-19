import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, X, Plus, Pencil, Check, Search } from 'lucide-react';
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
      <span className="text-slate-400 text-xs">
        Showing {total === 0 ? 0 : startIdx + 1} to {endIdx} of {total} entries
      </span>
      <div className="flex gap-1 flex-wrap">
        <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Previous
        </button>
        {getPageNumbers(currentPage, totalPages).map((page, idx) =>
          page === '...'
            ? <span key={`e${idx}`} className="px-1 text-slate-400 text-xs self-center">…</span>
            : <button key={`p${page}`} type="button" onClick={() => setPage(page as number)}
                className={`px-2 py-1 rounded-lg text-xs transition-all ${currentPage === page ? 'bg-blue-600 text-white font-semibold' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {page}
              </button>
        )}
        <button type="button" onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Next
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({
  title,
  subtitle,
  icon,
  onClose,
  wide,
  extraWide,
  children,
  footer,
  zIndex = 50,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  extraWide?: boolean;
  children: React.ReactNode;
  footer: React.ReactNode;
  zIndex?: number;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const maxW = extraWide ? 'max-w-3xl' : wide ? 'max-w-2xl' : 'max-w-md';

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        style={{ zIndex }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      {/* Modal card */}
      <div
        style={{ zIndex: zIndex + 1 }}
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className={`bg-white rounded-2xl shadow-[0_24px_60px_-8px_rgba(0,0,0,0.22)] w-full ${maxW} max-h-[88vh] flex flex-col pointer-events-auto overflow-hidden`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-slate-900 text-base font-semibold tracking-tight leading-tight">{title}</h2>
                {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5 flex-shrink-0 bg-slate-50/70">
            {footer}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5 mt-6 first:mt-0">
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.14em] whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form field components
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 placeholder-slate-400 transition-all duration-150';
const selectCls = `${inputCls} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")] bg-[length:14px_14px] bg-[right_10px_center] bg-no-repeat pr-8`;

// ─────────────────────────────────────────────────────────────────────────────
// MODAL 3 — Create / Edit Email Template Form
// ─────────────────────────────────────────────────────────────────────────────

function EmailTemplateFormModal({
  mode,
  initial,
  onClose,
  onSaved,
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

  const handleSubmit = async () => {
    if (!code.trim() || !subject.trim() || !message.trim()) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Code, Subject, and Message are required.', timer: 2000, showConfirmButton: true });
      return;
    }
    try {
      setSubmitting(true);
      const saved: EmailTemplateItem = { id: initial?.id ?? Date.now(), code, mailSubject: subject, mailMessage: message, isDefault };
      await Swal.fire({ icon: 'success', title: 'Success', text: mode === 'create' ? 'Template created.' : 'Template updated.', timer: 1800, showConfirmButton: false });
      onSaved(saved);
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
      title={mode === 'create' ? 'Create Email Template' : 'Edit Email Template'}
      subtitle={mode === 'create' ? 'Add a new reusable message template' : `Editing template: ${initial?.code}`}
      icon={<Mail className="w-4 h-4" />}
      onClose={onClose}
      wide
      zIndex={300}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium transition-all">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200">
            {submitting ? 'Saving…' : mode === 'create' ? 'Create Template' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="flex gap-6">
        {/* Left — fields */}
        <div className="space-y-5 flex-1 min-w-0">
          <Field label="Template Code" required hint="Max 10 characters. Cannot be changed after creation.">
            <input
              type="text"
              maxLength={10}
              value={code}
              onChange={e => setCode(e.target.value)}
              readOnly={mode === 'edit'}
              placeholder="e.g. LEAVE_01"
              className={`${inputCls} w-40 ${mode === 'edit' ? 'bg-slate-50 cursor-not-allowed text-slate-400' : ''}`}
            />
          </Field>

          <Field label="Mail Subject" required>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter email subject line…"
              className={inputCls}
            />
          </Field>

          <Field label="Mail Message" required>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={8}
              placeholder="Enter the email body. Use variable tags from the panel on the right…"
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </Field>

          {/* Is Default toggle */}
          <label className="flex items-center gap-3 cursor-pointer group py-0.5">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={e => setIsDefault(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-700">Set as Default</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Pre-selected when composing emails</p>
            </div>
          </label>
        </div>

        {/* Right — variables panel */}
        <div className="w-44 flex-shrink-0">
          <div className="sticky top-0 bg-gradient-to-b from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/80 p-4">
            <p className="text-[10px] font-medium text-blue-600 uppercase tracking-[0.15em] mb-3">Variables</p>
            <div className="space-y-3">
              {vars.map(v => (
                <div key={v.tag}>
                  <p className="text-[11px] text-slate-500 mb-1">{v.label}</p>
                  <code className="inline-flex items-center font-mono text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-lg text-[11px] shadow-sm">
                    {v.tag}
                  </code>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100">
              <p className="text-[11px] text-blue-500/80 leading-relaxed">
                Paste any tag into your message body.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL 2 — Email Template List
// ─────────────────────────────────────────────────────────────────────────────

function EmailTemplateModal({
  onClose,
  onSelectTemplate,
}: {
  onClose: () => void;
  onSelectTemplate: (code: string) => void;
}) {
  const [templates,  setTemplates]  = useState<EmailTemplateItem[]>([]);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  // null = no sub-modal; 'create' = create form; object = edit form
  const [subModal,   setSubModal]   = useState<null | 'create' | EmailTemplateItem>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        // const res = await apiClient.get('/EmailConfiguration/loadEmailTemplate');
        // setTemplates(...);
      } catch (e) { console.error('Failed to load email templates', e); }
    };
    load();
  }, []);

  const filtered   = templates.filter(t =>
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.mailSubject.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx   = (page - 1) * itemsPerPage;
  const endIdx     = Math.min(startIdx + itemsPerPage, filtered.length);
  const paginated  = filtered.slice(startIdx, endIdx);

  const handleSaved = (saved: EmailTemplateItem) =>
    setTemplates(prev => {
      const exists = prev.find(t => t.id === saved.id);
      return exists ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved];
    });

  return (
    <>
      {/* List modal — hidden while a sub-modal (create/edit) is open */}
      {subModal === null && (
        <ModalShell
          title="Email Templates"
          subtitle="Select or manage your message templates"
          icon={<Mail className="w-4 h-4" />}
          onClose={onClose}
          extraWide
          zIndex={200}
          footer={
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium transition-all">
              Close
            </button>
          }
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-5 border-b border-slate-100">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 placeholder-slate-400 transition-all"
                placeholder="Search templates…"
              />
            </div>
            <button
              type="button"
              onClick={() => setSubModal('create')}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-all shadow-sm shadow-blue-200 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Template
            </button>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3.5 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider w-28">Code</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">Mail Subject</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">Mail Message</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider w-24">Default</th>
                  <th className="px-5 py-3.5 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length > 0 ? paginated.map(t => (
                  <tr
                    key={t.id}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    onClick={() => { onSelectTemplate(t.code); onClose(); }}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{t.code}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{t.mailSubject}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs max-w-xs">
                      <span className="line-clamp-2 leading-relaxed">{t.mailMessage || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      {t.isDefault
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100">
                            <Check className="w-3 h-3" /> Default
                          </span>
                        : <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSubModal(t)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Mail className="w-6 h-6 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">No templates found</p>
                          <p className="text-xs text-slate-400 mt-0.5">Create your first template to get started</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              setPage={setPage}
              startIdx={startIdx}
              endIdx={endIdx}
              total={filtered.length}
            />
          )}
        </ModalShell>
      )}

      {/* Create form — replaces list modal */}
      {subModal === 'create' && (
        <EmailTemplateFormModal
          mode="create"
          onClose={() => setSubModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Edit form — replaces list modal */}
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
// MODAL 1 — Email Configuration (SMTP settings)   ← exported
// ─────────────────────────────────────────────────────────────────────────────

export function EmailConfigurationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [emailTypeCode,        setEmailTypeCode]        = useState('');
  const [emailSender,          setEmailSender]          = useState('');
  const [smtpServer,           setSmtpServer]           = useState('');
  const [password,             setPassword]             = useState('');
  const [confirmPassword,      setConfirmPassword]      = useState('');
  const [port,                 setPort]                 = useState('');
  const [sendOption,           setSendOption]           = useState('');
  const [targetName,           setTargetName]           = useState('');
  const [encryptionConnection, setEncryptionConnection] = useState('');
  const [showTemplateModal,    setShowTemplateModal]    = useState(false);

  if (!isOpen) return null;

  const handleBrowseTemplates = () => setShowTemplateModal(true);
  const handleTemplateModalClose = () => setShowTemplateModal(false);
  const handleTemplateSelected = (code: string) => {
    setEmailTypeCode(code);
    setShowTemplateModal(false);
  };

  return (
    <>
      {!showTemplateModal && (
        <ModalShell
          title="Email Configuration"
          subtitle="Configure your SMTP settings and email template"
          icon={<Mail className="w-4 h-4" />}
          onClose={onClose}
          extraWide
          zIndex={100}
          footer={
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
              >
                Save Configuration
              </button>
            </>
          }
        >
          <div className="space-y-6">
            {/* ── Email Template Card ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email Template</h3>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Field label="Selected Template">
                    <input
                      type="text"
                      value={emailTypeCode}
                      readOnly
                      placeholder="No template selected — browse to choose one"
                      className={`${inputCls} bg-white cursor-not-allowed text-slate-400`}
                    />
                  </Field>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleBrowseTemplates}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 flex items-center gap-2 transition-all whitespace-nowrap shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    Browse Templates
                  </button>
                  {emailTypeCode && (
                    <button
                      type="button"
                      onClick={() => setEmailTypeCode('')}
                      title="Clear selection"
                      className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all group shadow-sm"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Sender & Server Card ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sender & Server</h3>
              <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                  <Field label="Email Sender" required>
                    <input
                      type="email"
                      value={emailSender}
                      onChange={e => setEmailSender(e.target.value)}
                      placeholder="sender@company.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Send Option">
                    <select value={sendOption} onChange={e => setSendOption(e.target.value)} className={selectCls}>
                      <option value="">— Select option —</option>
                      <option value="SMTP">SMTP</option>
                      <option value="Others">Others</option>
                    </select>
                  </Field>
                </div>
                <div className="w-px bg-slate-100 flex-shrink-0 self-stretch" />
                <div className="flex-1 space-y-4">
                  <Field label="SMTP Server" required>
                    <input
                      value={smtpServer}
                      onChange={e => setSmtpServer(e.target.value)}
                      placeholder="smtp.company.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Port">
                    <input
                      value={port}
                      onChange={e => setPort(e.target.value)}
                      placeholder="e.g. 587"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Security Card ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Security</h3>
              <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                  <Field label="Password" required>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Encryption Connection">
                    <select value={encryptionConnection} onChange={e => setEncryptionConnection(e.target.value)} className={selectCls}>
                      <option value="">— Select encryption —</option>
                      <option value="None">None</option>
                      <option value="TLS">TLS</option>
                    </select>
                  </Field>
                </div>
                <div className="w-px bg-slate-100 flex-shrink-0 self-stretch" />
                <div className="flex-1 space-y-4">
                  <Field label="Confirm Password" required>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Target Name">
                    <input
                      value={targetName}
                      onChange={e => setTargetName(e.target.value)}
                      placeholder="Optional target name"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {showTemplateModal && (
        <EmailTemplateModal
          onClose={handleTemplateModalClose}
          onSelectTemplate={handleTemplateSelected}
        />
      )}
    </>
  );
}
