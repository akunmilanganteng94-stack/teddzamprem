import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { OrderTab } from './components/OrderTab';
import { HistoryTab } from './components/HistoryTab';
import { DepositTab } from './components/DepositTab';
import { ProfileTab } from './components/ProfileTab';
import { AdminPanel } from './components/admin/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { MessageCircle } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function MainLayout() {
  const { isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background radial glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-700/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setIsAdminView(false);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        isAdminView={isAdminView}
        onToggleAdminView={(val) => setIsAdminView(val)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full">
        {isAdminView && isAdmin ? (
          <AdminPanel
            onBackToStore={() => setIsAdminView(false)}
            onToast={addToast}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeTab
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}
            {currentTab === 'order' && (
              <OrderTab
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
                onToast={addToast}
              />
            )}
            {currentTab === 'history' && (
              <HistoryTab
                onOpenAuth={() => setIsAuthOpen(true)}
                onToast={addToast}
              />
            )}
            {currentTab === 'deposit' && (
              <DepositTab
                onOpenAuth={() => setIsAuthOpen(true)}
                onToast={addToast}
              />
            )}
            {currentTab === 'profile' && (
              <ProfileTab
                onOpenAuth={() => setIsAuthOpen(true)}
                onToggleAdminView={(val) => setIsAdminView(val)}
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onToast={addToast}
              />
            )}
          </>
        )}
      </main>

      {/* Floating WhatsApp Quick Action */}
      {!isAdminView && (
        <a
          href="https://wa.me/6283150921412"
          target="_blank"
          rel="noopener noreferrer"
          title="Bantuan WhatsApp"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-110 active:scale-95 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
        >
          <MessageCircle className="w-6 h-6 stroke-[2.2]" />
        </a>
      )}

      {/* Mobile Bottom Navigation */}
      {!isAdminView && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onToast={addToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainLayout />
      </StoreProvider>
    </AuthProvider>
  );
}
