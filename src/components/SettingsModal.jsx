import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { EMOJI_OPTIONS } from '../data';
import { User, Map, Database, Cpu, ShieldAlert, Check } from 'lucide-react';

const STYLE_LABELS = {
  streets: '🗺️ Streets',
  dark: '🕶️ Dark Mode',
  topo: '🏔️ Topography',
  outdoor: '🌲 Outdoor',
  ocean: '🌊 Oceanic',
  pastel: '🎨 Pastel',
  satellite: '🛰️ Satellite / Hybrid'
};

const DEFAULT_EMOJIS = ['📍', '☕', '🏠', '🍔', '🌲', '🎒', '📸', '✨', '🚲', '🍕'];

export default function SettingsModal() {
  const {
    settingsModalOpen,
    closeSettingsModal,
    mapStyle,
    changeMapStyle,
    defaultZoom,
    setDefaultZoom,
    defaultEmoji,
    setDefaultEmoji,
    exportUserData,
    importUserData,
    clearAllUserData,
    showToast
  } = useApp();

  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Danger zone confirmations
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync network state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset danger zone states on open/close
  useEffect(() => {
    if (!settingsModalOpen) {
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  }, [settingsModalOpen]);

  const handleClearCache = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        showToast('⚡ Cache cleared. Reloading...', 'ok');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        console.error('Cache clearing failed:', err);
        showToast('❌ Failed to clear cache');
      }
    } else {
      showToast('Cache API not supported in this browser.');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const success = await importUserData(evt.target.result);
      if (success) {
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('⚠️ Please type DELETE to confirm');
      return;
    }
    await clearAllUserData();
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    closeSettingsModal();
  };

  if (!settingsModalOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${
        settingsModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(7,7,13,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSettingsModal();
      }}
    >
      <div
        className="modal-panel bg-layer border border-b2 rounded-2xl w-[560px] max-w-[calc(100vw-32px)] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 36px 100px rgba(0,0,0,.7)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-b1">
          <div className="font-display text-lg font-bold">Settings</div>
          <button
            onClick={closeSettingsModal}
            className="w-8 h-8 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-150 text-lg leading-none hover:text-t1 hover:border-b2"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-elevated/40 border-b border-b1 overflow-x-auto custom-scrollbar">
          {[
            { id: 'account', label: 'Account', Icon: User },
            { id: 'map', label: 'Map', Icon: Map },
            { id: 'backup', label: 'Backup', Icon: Database },
            { id: 'cache', label: 'System', Icon: Cpu }
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 py-3 px-5 border-b-2 text-xs font-semibold tracking-wide uppercase transition-all duration-150 shrink-0 cursor-pointer
                ${
                  activeTab === id
                    ? 'border-primary text-t1 bg-layer'
                    : 'border-transparent text-t3 hover:text-t2 hover:bg-layer/30'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* 1. Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {user ? (
                <>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-elevated/30 border border-b1">
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-xl border border-b2 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-display font-bold text-base text-t1">{user.displayName}</div>
                      <div className="text-sm text-t3 font-mono">{user.email}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        signOut();
                        closeSettingsModal();
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-elevated border border-b1 text-sm font-bold text-t2 hover:bg-surface hover:text-t1 hover:border-b2 transition-all cursor-pointer text-center"
                    >
                      Sign Out Account
                    </button>
                  </div>

                  <div className="pt-6 border-t border-b1">
                    <h4 className="text-xs font-mono font-bold tracking-wider text-rose uppercase mb-3 flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Danger Zone
                    </h4>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-3 px-4 rounded-xl border border-rose/30 bg-rose/5 text-sm font-bold text-rose hover:bg-rose/15 hover:border-rose/50 transition-all cursor-pointer text-center"
                      >
                        Delete Database & All Saved Data
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-rose/5 border border-rose/30 space-y-4">
                        <div className="text-xs text-rose font-medium leading-relaxed">
                          WARNING: This operation is permanent and cannot be undone. All places, trips, collections, and journal entries will be deleted from your Cloud Firestore.
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-t3 uppercase block">Type "DELETE" below to confirm:</label>
                          <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE"
                            className="w-full bg-elevated border border-rose/30 rounded-lg py-2.5 px-4 text-t1 font-mono text-sm outline-none transition-all placeholder:text-t3 focus:border-rose/50"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 px-3 bg-elevated border border-b1 rounded-lg text-xs font-bold text-t2 hover:bg-surface hover:text-t1 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAll}
                            className="flex-1 py-2 px-3 bg-rose text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-t3">Not logged in.</div>
              )}
            </div>
          )}

          {/* 2. Map Customization Tab */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              {/* Map Style Selector */}
              <div>
                <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-3 block">
                  Active Map Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STYLE_LABELS).map(([styleId, label]) => (
                    <button
                      key={styleId}
                      onClick={() => changeMapStyle(styleId)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-150 cursor-pointer flex justify-between items-center
                        ${
                          mapStyle === styleId
                            ? 'bg-pglow border-primary text-ta shadow-sm'
                            : 'bg-elevated border-b1 text-t2 hover:border-b2 hover:bg-surface'
                        }`}
                    >
                      <span>{label}</span>
                      {mapStyle === styleId && <Check size={14} className="text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Zoom Slider */}
              <div className="pt-4 border-t border-b1">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 block">
                    Default Fly-to Zoom
                  </label>
                  <span className="text-xs font-mono font-bold text-t1 bg-elevated border border-b1 rounded-md px-2 py-0.5">
                    {defaultZoom}
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={defaultZoom}
                  onChange={(e) => setDefaultZoom(Number(e.target.value))}
                  className="w-full accent-primary bg-b1 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-t3 mt-1.5 block">
                  Defines the default zoom level when clicking to view a saved spot or dropping a marker.
                </span>
              </div>

              {/* Default Emoji Option */}
              <div className="pt-4 border-t border-b1">
                <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-3 block">
                  Default Place Emoji
                </label>
                
                {/* Quick select list */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {DEFAULT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setDefaultEmoji(e)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all border
                        ${
                          defaultEmoji === e
                            ? 'border-primary bg-pglow scale-110'
                            : 'border-b1 bg-elevated hover:bg-surface hover:border-b2'
                        }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                
                {/* Custom text input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    value={defaultEmoji}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (val) setDefaultEmoji(val);
                    }}
                    className="w-12 bg-elevated border border-b1 rounded-lg py-2 text-center text-t1 font-body text-base outline-none focus:border-ba"
                  />
                  <span className="text-[10px] text-t3">
                    Type or paste any character/emoji to use as default for newly added markers.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Backup & Sync Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-elevated/20 border border-b1 space-y-3">
                <h4 className="text-sm font-bold text-t1">Export Data</h4>
                <p className="text-xs text-t3 leading-relaxed">
                  Download all your logged places, journeys, itineraries, and photo references as a local JSON file. You can keep this as a personal backup or import it onto another account.
                </p>
                <button
                  onClick={exportUserData}
                  className="py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors cursor-pointer w-full text-center"
                >
                  Download trace_backup.json
                </button>
              </div>

              <div className="p-4 rounded-xl bg-elevated/20 border border-b1 space-y-3">
                <h4 className="text-sm font-bold text-t1">Import Data</h4>
                <p className="text-xs text-t3 leading-relaxed">
                  Upload a previously saved `.json` backup file. Trace will parse and merge your entries back into your Firestore cloud database. Existing exact duplicates are skipped.
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                    id="trace-import-input"
                  />
                  <label
                    htmlFor="trace-import-input"
                    className="block py-2.5 px-4 rounded-xl bg-elevated border border-b1 hover:bg-surface hover:border-b2 text-t2 hover:text-t1 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Select & Import JSON File
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 4. Cache & System Tab */}
          {activeTab === 'cache' && (
            <div className="space-y-6">
              {/* Online/Offline Status Indicator */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-elevated/20 border border-b1">
                <div>
                  <h4 className="text-sm font-bold text-t1">Network Connectivity</h4>
                  <p className="text-xs text-t3">Real-time status of your connection</p>
                </div>
                <div
                  className={`py-1 px-3.5 rounded-full text-xs font-bold border tracking-wider uppercase flex items-center gap-1.5
                    ${
                      isOnline
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* Cache Management */}
              <div className="p-4 rounded-xl bg-elevated/20 border border-b1 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-t1">App Cache</h4>
                  <p className="text-xs text-t3 leading-relaxed mt-1">
                    Trace keeps offline files (scripts, stylesheets, fonts) and MapTiler tiles saved locally. If you're encountering glitches or outdated views, clearing the cache forces the service worker to redownload all assets fresh.
                  </p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="py-2.5 px-4 rounded-xl border border-b1 bg-elevated text-t2 hover:text-t1 hover:bg-surface hover:border-b2 font-bold text-xs transition-colors cursor-pointer w-full text-center"
                >
                  Clear Offline Caches & Reload
                </button>
              </div>

              {/* Build Info */}
              <div className="flex justify-between items-center text-[10px] font-mono text-t3 pt-2">
                <span>PWA Version</span>
                <span>v1.0.1</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
