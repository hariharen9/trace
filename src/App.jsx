import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import FloatingControls from './components/FloatingControls'
import AddPlaceModal from './components/AddPlaceModal'
import AISearchModal from './components/AISearchModal'
import ContextMenu from './components/ContextMenu'
import ToastContainer from './components/ToastContainer'

export default function App() {
  return (
    <AppProvider>
      <div className="app-layout flex w-full h-full relative overflow-hidden">
        <Sidebar />
        <div className="app-map flex-1 h-full relative">
          <MapView />
        </div>
      </div>
      <FloatingControls />
      <AddPlaceModal />
      <AISearchModal />
      <ContextMenu />
      <ToastContainer />
    </AppProvider>
  )
}
