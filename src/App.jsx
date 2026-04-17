import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InventoryList } from './components/Inventory';
import { AddItemModal } from './components/AddItemModal';
import { AboutModal } from './components/AboutModal';
import { ExpirationConfigModal } from './components/ExpirationConfigModal';
import { FamilySettings } from './components/FamilySettings';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { ShoppingListModal } from './components/ShoppingListModal';
import { useInventory } from './hooks/useInventory';
import { useExpirationConfig } from './hooks/useExpirationConfig';
import { useShoppingList } from './hooks/useShoppingList';
import { translations } from './i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, WifiOff } from 'lucide-react';
import { supabase } from './supabase';

// --- Error Boundary: catches render errors and shows a friendly screen ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('App crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px', padding: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>❄️</span>
          <h2 style={{ color: 'white' }}>Oups, quelque chose s'est figé…</h2>
          <p style={{ color: '#94a3b8' }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ background: 'var(--accent)', color: '#020617', padding: '12px 24px', borderRadius: '12px', fontWeight: '700' }}>Relancer l'application</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { 
    items, 
    drawers,
    loading,
    syncError,
    familyId, 
    addItem, 
    updateItem, 
    deleteItem, 
    addDrawer,
    deleteDrawer,
    updateDrawer,
    createFamily, 
    joinFamily, 
    leaveFamily, 
    getItemSuggestions 
  } = useInventory();

  // Customization State
  const [language, setLanguage] = useState(() => localStorage.getItem('myfryz_lang') || 'fr');
  const [theme, setTheme] = useState(() => localStorage.getItem('myfryz_theme') || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isFamilySettingsOpen, setIsFamilySettingsOpen] = useState(false);
  const [expirationConfig, setExpirationConfig] = useExpirationConfig();
  const { shoppingList, addToList, removeFromList, clearList, loading: shoppingLoading } = useShoppingList(familyId);

  const t = translations[language];

  // Persist Customization
  useEffect(() => {
    localStorage.setItem('myfryz_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('myfryz_theme', theme);
    document.body.className = theme;
  }, [theme]);

  // Handle missing supabase env
  const isCloudEnabled = !!supabase;

  return (
    <Layout 
      onAddClick={() => setIsAddModalOpen(true)}
      onAboutClick={() => setIsAboutModalOpen(true)}
      onExpirationClick={() => setIsExpirationModalOpen(true)}
      onShoppingListClick={() => setIsShoppingListOpen(true)}
      onFamilyClick={() => setIsFamilySettingsOpen(true)}
      t={t}
    >
      <div className="section-header">
        <h2>{t.stock}</h2>
        <div className="status-row">
          {familyId && (
            <span className={`cloud-badge ${!isCloudEnabled ? 'offline' : ''}`} onClick={() => !isCloudEnabled && setIsSupabaseConfigOpen(true)}>
              {isCloudEnabled ? 'Cloud Sync ON' : 'Offline Mode (Local only)'}
            </span>
          )}
          {syncError && (
            <span className="cloud-badge offline" title={syncError}>
              <WifiOff size={10} style={{ marginRight: '4px' }} />
              Sync error
            </span>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={40} />
          <p>Synchronisation...</p>
        </div>
      ) : (
        <InventoryList 
          items={items} 
          drawers={drawers}
          onUpdate={updateItem} 
          onDelete={deleteItem} 
          addDrawer={addDrawer}
          deleteDrawer={deleteDrawer}
          updateDrawer={updateDrawer}
          expirationConfig={expirationConfig}
          onAddToList={addToList}
          t={t}
        />
      )}

      <FamilySettings 
        isOpen={isFamilySettingsOpen}
        onClose={() => setIsFamilySettingsOpen(false)}
        familyId={familyId}
        createFamily={createFamily}
        joinFamily={joinFamily}
        leaveFamily={leaveFamily}
        itemCount={items.length}
        isCloudEnabled={isCloudEnabled}
        onOpenCloudConfig={() => setIsSupabaseConfigOpen(true)}
        t={t}
      />

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addItem}
        getItemSuggestions={getItemSuggestions}
        drawers={drawers}
        expirationEnabled={expirationConfig.enabled}
        t={t}
      />

      <AboutModal 
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        t={t}
      />

      <ExpirationConfigModal 
        isOpen={isExpirationModalOpen}
        onClose={() => setIsExpirationModalOpen(false)}
        config={expirationConfig}
        setConfig={setExpirationConfig}
        t={t}
      />

      <ShoppingListModal 
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        shoppingList={shoppingList}
        onRemove={removeFromList}
        onClear={clearList}
        loading={shoppingLoading}
        t={t}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        t={t}
      />
    </Layout>
  );
}

export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
