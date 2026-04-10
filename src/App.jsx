import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InventoryList } from './components/Inventory';
import { AddItemModal } from './components/AddItemModal';
import { AboutModal } from './components/AboutModal';
import { FamilySettings } from './components/FamilySettings';
import { useInventory } from './hooks/useInventory';
import { translations } from './i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function App() {
  const { 
    items, 
    drawers,
    loading, 
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
  const [activeTab, setActiveTab] = useState('stock');

  const t = translations[language];

  // Persist Customization
  useEffect(() => {
    localStorage.setItem('myfryz_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('myfryz_theme', theme);
    document.body.className = theme;
  }, [theme]);

  return (
    <Layout 
      onAddClick={() => setIsAddModalOpen(true)}
      onAboutClick={() => setIsAboutModalOpen(true)}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      t={t}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'stock' ? (
          <motion.div
            key="stock"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="section-header">
              <h2>{t.stock}</h2>
              <div className="status-row">
                <p>{items.length} {t.total_items}</p>
                {familyId && <span className="cloud-badge">Cloud Sync ON</span>}
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
                t={t}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="family"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FamilySettings 
              familyId={familyId}
              createFamily={createFamily}
              joinFamily={joinFamily}
              leaveFamily={leaveFamily}
              itemCount={items.length}
              t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addItem}
        getItemSuggestions={getItemSuggestions}
        drawers={drawers}
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
    </Layout>
  );
}

export default App;
