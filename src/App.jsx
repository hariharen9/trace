import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import FloatingControls from './components/FloatingControls'
import PlaceModal from './components/PlaceModal'
import CollectionModal from './components/CollectionModal'
import JournalModal from './components/JournalModal'
import TripModal from './components/TripModal'
import SearchModal from './components/SearchModal'
import SettingsModal from './components/SettingsModal'
import ContextMenu from './components/ContextMenu'
import ToastContainer from './components/ToastContainer'

function AppContent() {
  const { user, loading } = useAuth();

  // ── Loading state ──
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'var(--color-void)' }}>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse-dot"
            style={{ boxShadow: '0 0 14px var(--color-primary)' }} />
          <span className="font-display text-xl font-bold tracking-[-0.04em] text-t2">
            TRACE
          </span>
        </div>
      </div>
    );
  }

  // ── Not authenticated ──
  if (!user) {
    return <LoginScreen />;
  }

  // ── Authenticated ──
  return (
    <AppProvider>
      <div className="app-layout flex flex-col md:flex-row w-full h-full relative overflow-hidden">
        <Sidebar />
        <div className="app-map max-md:absolute max-md:inset-0 max-md:z-0 md:flex-1 h-full relative">
          <MapView />
        </div>
      </div>
      <FloatingControls />
      <PlaceModal />
      <CollectionModal />
      <JournalModal />
      <TripModal />
      <SearchModal />
      <SettingsModal />
      <ContextMenu />
      <ToastContainer />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
