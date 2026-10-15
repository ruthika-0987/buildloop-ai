import React, { useState } from 'react';
import {
  Recycle,
  Layers,
  ClipboardList,
  ShoppingCart,
  Microscope,
  Radio,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Shield,
  Bell,
  User as UserIcon,
  Globe,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation, t } from '../i18n';
import { Language } from '../types';

interface NavbarProps {
  onOpenSimpleMode?: () => void;
  onOpenWorkspace?: () => void;
  onOpenCloudSql?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSimpleMode,
  onOpenWorkspace,
  onOpenCloudSql,
}) => {
  const { user, signout, isSeller, isBuyer, isAdmin, isInspector } = useAuth();
  const { syncStatus, alerts, markAlertRead } = useData();
  const { currentLanguage, setLanguage } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const unreadAlerts = alerts.filter(a => a.userId === user?.id && !a.read);

  const languages: Array<{ code: Language; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  const currentHash = window.location.hash || '#/';

  const navLinks = [
    { href: '#/', label: t("Home"), icon: Recycle },
    { href: '#/batches', label: t("Batches"), icon: Layers },
    { href: '#/demands', label: t("Demand Board"), icon: ClipboardList },
    { href: '#/orders', label: t("Orders"), icon: ShoppingCart },
    { href: '#/intel', label: t("Recovery Intel"), icon: Microscope },
    { href: '#/iot', label: t("IoT Sensors"), icon: Radio },
    { href: '#/impact', label: t("Impact"), icon: BarChart3 },
    { href: '#/validation', label: t("Validation"), icon: CheckCircle2 },
    { href: '#/coverage', label: t("Coverage"), icon: HelpCircle },
    { href: '#/about', label: t("About"), icon: HelpCircle }
  ];

  if (isAdmin) {
    navLinks.push({ href: '#/admin', label: t("Admin"), icon: Shield });
  }

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Motto */}
          <div className="flex items-center gap-3">
            <a href="#/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
                <Recycle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                  BuildLoop <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                  Hyderabad C&D Reuse
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navLinks.slice(0, 8).map(link => {
              const active = currentHash === link.href || (link.href !== '#/' && currentHash.startsWith(link.href));
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-stone-800 text-emerald-400 border border-stone-700'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right actions: Simple Mode, Workspace, Cloud SQL, Quick Listing, Status, Lang, Alerts, User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Simple Picture Mode for Uneducated / Field Workers */}
            {onOpenSimpleMode && (
              <button
                onClick={onOpenSimpleMode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-900 shadow-sm transition"
                title="Simple Picture Mode for field workers & drivers / చిత్రాల మోడ్"
              >
                <span>👷‍♂️</span>
                <span className="hidden sm:inline">
                  {currentLanguage === 'te' ? 'చిత్రాల మోడ్' : currentLanguage === 'hi' ? 'चित्र मोड' : 'Simple Mode'}
                </span>
              </button>
            )}

            {/* Google Workspace Hub */}
            {onOpenWorkspace && (
              <button
                onClick={onOpenWorkspace}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
                title="Google Workspace Hub: Gmail & Contacts"
              >
                <span>📧</span>
                <span>Gmail &amp; Contacts</span>
              </button>
            )}

            {/* Cloud SQL Stats */}
            {onOpenCloudSql && (
              <button
                onClick={onOpenCloudSql}
                className="hidden xl:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 border border-stone-700 text-cyan-400 shadow-sm transition"
                title="View Cloud SQL PostgreSQL Status"
              >
                <span>🐘</span>
                <span>Cloud SQL</span>
              </button>
            )}

            {/* Quick Listing / Demand Buttons */}
            {user && (isSeller || isAdmin) && (
              <a
                href="#/batches/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("List a Batch")}</span>
              </a>
            )}

            {/* Sync status chip */}
            <div
              title="Real-time multi-device sync status"
              className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-stone-800/80 border border-stone-700 text-stone-300"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'Saved'
                    ? 'bg-emerald-400'
                    : syncStatus === 'Saving…'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-red-400'
                }`}
              />
              <span>{t(syncStatus)}</span>
            </div>

            {/* Language Picker */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                aria-label="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase">{currentLanguage}</span>
              </button>

              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-32 bg-stone-800 border border-stone-700 rounded-xl shadow-xl py-1 z-50 text-xs"
                  onClick={() => setLangMenuOpen(false)}
                >
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                        currentLanguage === l.code
                          ? 'text-emerald-400 font-bold bg-stone-700/60'
                          : 'text-stone-200 hover:bg-stone-700'
                      }`}
                    >
                      <span>{l.label}</span>
                      {currentLanguage === l.code && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Alerts Dropdown (when signed in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setAlertsOpen(!alertsOpen)}
                  className="relative p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800"
                  aria-label="View alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadAlerts.length}
                    </span>
                  )}
                </button>

                {alertsOpen && (
                  <div className="absolute right-0 mt-1 w-80 bg-stone-800 border border-stone-700 rounded-xl shadow-xl p-2 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-700 px-2 font-semibold text-stone-200">
                      <span>{t("Alerts")} ({unreadAlerts.length})</span>
                      <button onClick={() => setAlertsOpen(false)} className="text-stone-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {unreadAlerts.length === 0 ? (
                      <p className="text-stone-400 p-3 text-center">{t("No unread alerts")}</p>
                    ) : (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {unreadAlerts.map(alt => (
                          <div
                            key={alt.id}
                            className="p-2.5 rounded-lg bg-stone-700/50 hover:bg-stone-700 cursor-pointer"
                            onClick={() => {
                              markAlertRead(alt.id);
                              setAlertsOpen(false);
                              window.location.hash = alt.link;
                            }}
                          >
                            <p className="font-semibold text-emerald-400">{alt.title}</p>
                            <p className="text-stone-300 text-[11px] mt-0.5">{alt.body}</p>
                            <span className="text-[9px] text-stone-400 mt-1 block">
                              {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile or Sign In */}
            {user ? (
              <div className="flex items-center gap-2">
                <a
                  href="#/profile"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold"
                >
                  <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
                  <span className="px-1 py-0.2 rounded text-[9px] uppercase font-bold bg-stone-700 text-stone-300">
                    {user.role}
                  </span>
                </a>
                <button
                  onClick={signout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-red-400 hover:bg-stone-800"
                >
                  {t("Sign Out")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="#/signin"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-200 hover:bg-stone-800"
                >
                  {t("Sign In")}
                </a>
                <a
                  href="#/signup"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  {t("Sign Up")}
                </a>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-300 hover:bg-stone-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-800 border-b border-stone-700 px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 border-b border-stone-700 flex items-center justify-between text-xs text-stone-400">
            <span>{t("Status")}: {t(syncStatus)}</span>
            {user && (
              <span className="text-emerald-400 font-medium">
                {t("Role")}: {user.role}
              </span>
            )}
          </div>
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-stone-200 hover:bg-stone-700"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{link.label}</span>
              </a>
            );
          })}
          {user && (isSeller || isAdmin) && (
            <div className="pt-2">
              <a
                href="#/batches/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white text-center"
              >
                <Plus className="w-4 h-4" />
                <span>{t("List a Batch")}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
