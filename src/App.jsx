import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { InventoryList } from './components/Inventory';
import { AddItemModal } from './components/AddItemModal';
import { FamilySettings } from './components/FamilySettings';
import { useInventory } from './hooks/useInventory';
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
    createFamily, 
    joinFamily, 
    leaveFamily, 
    getItemSuggestions 
  } = useInventory();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stock');

  return (
    <Layout 
      onAddClick={() => setIsAddModalOpen(true)}
      activeTab={activeTab}
      onTabChange={setActiveTab}
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
              <h2>Mon Inventaire</h2>
              <div className="status-row">
                <p>{items.length} articles au total</p>
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
      />
    </Layout>
  );
}

export default App;
