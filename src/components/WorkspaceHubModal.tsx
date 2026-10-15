import React, { useState, useEffect } from 'react';
import { X, Mail, Users, Send, Phone, UserCheck, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchGoogleContacts, fetchRecentGmailMessages, sendGmailMessage, GoogleContact, WorkspaceEmail } from '../lib/workspace';

interface WorkspaceHubModalProps {
  onClose: () => void;
  orderContext?: any;
}

export const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({ onClose, orderContext }) => {
  const { accessToken, user, signInWithGoogle } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'contacts' | 'gmail' | 'compose'>('contacts');
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [emails, setEmails] = useState<WorkspaceEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<GoogleContact | null>(null);

  // Compose State
  const [recipientEmail, setRecipientEmail] = useState(
    orderContext?.buyerEmail || 'dasapatriruthika@gmail.com'
  );
  const [emailSubject, setEmailSubject] = useState(
    orderContext
      ? `BuildLoop AI: Order Confirmation #${orderContext.id} - ${orderContext.orderType || 'Verified C&D Material'}`
      : 'BuildLoop AI: Hyderabad C&D Material Recovery Dispatch Notice'
  );
  const [emailBody, setEmailBody] = useState(
    `Dear Partner,\n\nHere is your official BuildLoop AI C&D material dispatch certificate from Hyderabad Recovery Site.\n\n• Material: Certified Red Clay Bricks / RCA\n• Matching Score: 87% (Strong Feasible Reuse)\n• Verification Status: Lab Tested & Seal Attached\n• Escrow Buyer Protection: Active\n\nThank you for fostering Hyderabad's circular economy!\n\nBest regards,\nBuildLoop AI Dispatch Team`
  );
  const [showConfirmSendDialog, setShowConfirmSendDialog] = useState(false);
  const [sending, setSending] = useState(false);

  // Load Contacts and Gmail messages when token is available
  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const loadData = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [fetchedContacts, fetchedEmails] = await Promise.all([
        fetchGoogleContacts(accessToken),
        fetchRecentGmailMessages(accessToken),
      ]);
      setContacts(fetchedContacts);
      setEmails(fetchedEmails);
    } catch (err: any) {
      console.warn('Workspace data fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!accessToken) {
      showError('Authentication required', 'Please sign in with Google to send emails.');
      return;
    }
    if (!recipientEmail || !recipientEmail.includes('@')) {
      showError('Invalid recipient', 'Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      const result = await sendGmailMessage(accessToken, recipientEmail, emailSubject, emailBody);
      if (result.success) {
        showSuccess(`Email Sent via Gmail! Message dispatched to ${recipientEmail}`);
        setShowConfirmSendDialog(false);
        setActiveTab('gmail');
        loadData();
      } else {
        showError('Gmail dispatch error', result.error || 'Failed to send message.');
      }
    } catch (err: any) {
      showError('Failed to send email', err.message || 'Error communicating with Gmail API.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative text-stone-900 dark:text-stone-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Google Workspace Hub</h2>
              <p className="text-xs text-stone-500 font-medium">
                Integrated Gmail &amp; Google Contacts for Hyderabad C&amp;D Supply Chain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Barrier if not signed in with Google */}
        {!accessToken ? (
          <div className="p-8 text-center space-y-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">Connect your Google Account</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Enable Google Contacts to directly choose truck drivers and site engineers, and use Gmail to send verified material dispatch certificates and invoices.
            </p>
            <button
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch (e: any) {
                  showError('Google Sign-in failed', e.message);
                }
              }}
              className="px-6 py-3 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-3 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Authorize Google Workspace Scopes</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-stone-200 dark:border-stone-800 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('contacts')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'contacts'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Google Contacts ({contacts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'compose'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Compose / Send Notice</span>
              </button>
              <button
                onClick={() => setActiveTab('gmail')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'gmail'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Recent Gmail Threads ({emails.length})</span>
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="ml-auto text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 pb-2.5"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tab 1: Contacts Picker */}
            {activeTab === 'contacts' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-500">
                  Select a contact below to assign as contractor, truck driver, or buyer for automatic receipt emailing:
                </p>

                {contacts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                    No contacts found in Google account or sync in progress.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {contacts.map((c, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          selectedContact?.resourceName === c.resourceName
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-sm'
                            : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                        onClick={() => {
                          setSelectedContact(c);
                          if (c.email) setRecipientEmail(c.email);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {c.photoUrl ? (
                            <img src={c.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-xs">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-xs">{c.name}</div>
                            <div className="text-[11px] text-stone-400">{c.email || c.phone || 'No direct phone'}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                              title="Call Contact"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContact(c);
                              if (c.email) setRecipientEmail(c.email);
                              setActiveTab('compose');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center gap-1 shadow-xs hover:bg-blue-500"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Select for Email</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Compose Email */}
            {activeTab === 'compose' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-stone-600 dark:text-stone-400">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="contractor@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-600 dark:text-stone-400">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-600 dark:text-stone-400">
                    Email Message Content
                  </label>
                  <textarea
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmSendDialog(true)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send via Gmail</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Recent Gmail Messages */}
            {activeTab === 'gmail' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-500">
                  Recent Gmail notifications related to construction material deliveries:
                </p>

                {emails.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                    No matching recent Gmail messages found.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {emails.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50/50 dark:bg-stone-800/30"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-stone-800 dark:text-stone-200">{m.from}</span>
                          <span className="text-stone-400">{m.date}</span>
                        </div>
                        <div className="font-semibold text-xs text-blue-600 dark:text-blue-400">{m.subject}</div>
                        <div className="text-[11px] text-stone-500 line-clamp-2">{m.snippet}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mandatory Confirmation Dialog for Workspace Mutating Action (Workspace Skill Requirement) */}
        {showConfirmSendDialog && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-black text-base">Confirm Sending Gmail Message</h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                You are about to send a real email message through your connected Gmail account to:
                <br />
                <strong className="text-stone-900 dark:text-stone-100">{recipientEmail}</strong>
                <br />
                Subject: <em>{emailSubject}</em>
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmSendDialog(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-2"
                >
                  {sending ? 'Sending...' : 'Confirm & Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
