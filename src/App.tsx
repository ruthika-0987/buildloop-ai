import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OnboardingModal } from './components/OnboardingModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { BatchListPage } from './pages/BatchListPage';
import { BatchCreateWizard } from './pages/BatchCreateWizard';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { DemandBoardPage } from './pages/DemandBoardPage';
import { DemandDetailPage } from './pages/DemandDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { DriverTrackingPage } from './pages/DriverTrackingPage';
import { RecoveryIntelPage } from './pages/RecoveryIntelPage';
import { IotRegistryPage } from './pages/IotRegistryPage';
import { ImpactPage } from './pages/ImpactPage';
import { ValidationPage } from './pages/ValidationPage';
import { CoveragePage } from './pages/CoveragePage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage, ProfilePage } from './pages/AuthPage';

// Simple Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('[BuildLoop ErrorBoundary caught]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
          <div className="max-w-md w-full p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-xs text-stone-500">
              {this.state.error?.message || 'An unexpected runtime error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.hash = '#/';
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Router component reading window.location.hash
function RouterView({ onOpenOnboarding }: { onOpenOnboarding: () => void }) {
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const route = hash.replace(/^#/, '') || '/';

  // Driver view (/d/:token)
  if (route.startsWith('/d/')) {
    const token = route.replace('/d/', '');
    return <DriverTrackingPage token={token} />;
  }

  // Batch details (/batches/:id or /b/:id)
  if (route.startsWith('/batches/') && route !== '/batches/new') {
    const batchId = route.replace('/batches/', '');
    return <BatchDetailPage batchId={batchId} />;
  }
  if (route.startsWith('/b/')) {
    const batchId = route.replace('/b/', '');
    return <BatchDetailPage batchId={batchId} />;
  }

  // Demand details (/demands/:id)
  if (route.startsWith('/demands/') && route !== '/demands/new') {
    const demandId = route.replace('/demands/', '');
    return <DemandDetailPage demandId={demandId} />;
  }

  // Order details (/orders/:id)
  if (route.startsWith('/orders/') && route !== '/orders/new') {
    const orderId = route.replace('/orders/', '');
    return <OrderDetailPage orderId={orderId} />;
  }

  switch (route) {
    case '/':
      return <LandingPage onOpenOnboarding={onOpenOnboarding} />;
    case '/batches':
      return <BatchListPage />;
    case '/batches/new':
      return <BatchCreateWizard />;
    case '/demands':
      return <DemandBoardPage />;
    case '/orders':
      return <OrdersPage />;
    case '/intel':
      return <RecoveryIntelPage />;
    case '/iot':
      return <IotRegistryPage />;
    case '/impact':
      return <ImpactPage />;
    case '/validation':
      return <ValidationPage />;
    case '/coverage':
      return <CoveragePage />;
    case '/about':
      return <AboutPage />;
    case '/admin':
      return <AdminPage />;
    case '/profile':
      return <ProfilePage />;
    case '/signin':
      return <AuthPage mode="signin" />;
    case '/signup':
      return <AuthPage mode="signup" />;
    default:
      return (
        <div className="py-20 text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">404</h2>
          <p className="text-xs text-stone-500">The requested page does not exist.</p>
          <a
            href="#/"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
          >
            Go to Home
          </a>
        </div>
      );
  }
}

import { VoiceAssistantBar } from './components/VoiceAssistantBar';
import { SimpleModeModal } from './components/SimpleModeModal';
import { WorkspaceHubModal } from './components/WorkspaceHubModal';
import { CloudSqlStatsModal } from './components/CloudSqlStatsModal';

export default function App() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [simpleModeOpen, setSimpleModeOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [cloudSqlOpen, setCloudSqlOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
              <Navbar
                onOpenSimpleMode={() => setSimpleModeOpen(true)}
                onOpenWorkspace={() => setWorkspaceOpen(true)}
                onOpenCloudSql={() => setCloudSqlOpen(true)}
              />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <VoiceAssistantBar
                  onFilterChange={(query) => {
                    if (query.toLowerCase().includes('brick') || query.includes('ఇటుక') || query.includes('ईंट')) {
                      window.location.hash = '#/batches';
                    } else if (query.toLowerCase().includes('concrete') || query.includes('కాంక్రీట్')) {
                      window.location.hash = '#/batches';
                    } else if (query.toLowerCase().includes('order') || query.includes('ఆర్డర్')) {
                      window.location.hash = '#/orders';
                    } else {
                      window.location.hash = '#/batches';
                    }
                  }}
                />
                <RouterView onOpenOnboarding={() => setOnboardingOpen(true)} />
              </main>
              <Footer onOpenOnboarding={() => setOnboardingOpen(true)} />

              {/* Modals */}
              {onboardingOpen && <OnboardingModal onClose={() => setOnboardingOpen(false)} />}
              {simpleModeOpen && (
                <SimpleModeModal
                  onClose={() => setSimpleModeOpen(false)}
                  onOpenWorkspace={() => setWorkspaceOpen(true)}
                />
              )}
              {workspaceOpen && <WorkspaceHubModal onClose={() => setWorkspaceOpen(false)} />}
              {cloudSqlOpen && <CloudSqlStatsModal onClose={() => setCloudSqlOpen(false)} />}
            </div>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
