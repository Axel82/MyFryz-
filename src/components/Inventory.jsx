import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Trash2, ChevronRight, X, PlusCircle, Edit3, FolderPlus, Bell } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';
import { EditItemModal } from './EditItemModal';

// --- Popup Modal for adding a drawer ---
const AddDrawerModal = ({ isOpen, onClose, onAdd, t }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="add-modal glass-dark"
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderPlus size={20} className="icon-blue" />
                <h2>{t.add_drawer}</h2>
              </div>
              <button onClick={onClose} className="icon-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
              <div className="input-group">
                <label>{t.add_drawer}</label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="ex: Tiroir 1, Bac légumes…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary submit-btn"
                style={{ marginTop: '16px', width: '100%' }}
                disabled={!name.trim()}
              >
                {t.add_drawer}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const ItemRow = ({ item, onClick, expirationConfig }) => {
  const category = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

  let alertLevel = 0;
  if (expirationConfig?.enabled && item.item_date) {
    const today = new Date();
    const itemDate = new Date(item.item_date);
    let monthsPassed = (today.getFullYear() - itemDate.getFullYear()) * 12 + today.getMonth() - itemDate.getMonth();
    if (today.getDate() < itemDate.getDate()) {
      monthsPassed--;
    }
    
    if (monthsPassed >= expirationConfig.level2Months) {
      alertLevel = 2;
    } else if (monthsPassed >= expirationConfig.level1Months) {
      alertLevel = 1;
    }
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="item-row clickable"
      onClick={() => onClick(item)}
    >
      <div className="row-indicator" style={{ backgroundColor: category.color }}></div>
      
      <div className="row-content">
        <div className="row-info">
          <div className="title-wrapper">
            {alertLevel === 2 && <Bell size={16} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' }} />}
            {alertLevel === 1 && <Bell size={16} style={{ color: '#eab308', filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.5))' }} />}
            <h3>{item.name}</h3>
            {item.weight > 0 && <span className="weight-badge">{item.weight}g</span>}
          </div>
        </div>

        <div className="row-actions">
           <span className="qty-badge">x{item.quantity}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const InventoryList = ({ items, drawers, onUpdate, onDelete, addDrawer, deleteDrawer, updateDrawer, expirationConfig, onAddToList, t }) => {
  const [drawerToDelete, setDrawerToDelete] = useState(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [collapsedDrawers, setCollapsedDrawers] = useState({});
  const [editingDrawerId, setEditingDrawerId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const toggleDrawer = (drawerName) => {
    setCollapsedDrawers(prev => ({
      ...prev,
      [drawerName]: !prev[drawerName]
    }));
  };

  const groupedItems = items.reduce((acc, item) => {
    const drawer = item.location || 'Sans emplacement';
    if (!acc[drawer]) acc[drawer] = [];
    acc[drawer].push(item);
    return acc;
  }, {});

  const handleDeleteDrawer = (e, drawerName) => {
    e.stopPropagation();
    const drawerItems = groupedItems[drawerName] || [];
    if (drawerItems.length > 0) {
      if (confirm(t.confirm_delete_drawer.replace('{count}', drawerItems.length))) {
        deleteDrawer(drawerName);
      }
    } else {
      deleteDrawer(drawerName);
    }
  };

  const handleStartEditingDrawer = (e, drawer) => {
    e.stopPropagation();
    setEditingDrawerId(drawer.id || drawer.name);
    setEditName(drawer.name);
  };

  const handleSaveDrawerRename = (drawerId, oldName) => {
    if (editName.trim() && editName !== oldName) {
      updateDrawer(drawerId, editName.trim(), oldName);
    }
    setEditingDrawerId(null);
  };

  if (drawers.length === 0 && items.length === 0) {
    return (
      <>
        <div className="empty-state">
          <Package size={48} className="empty-icon" />
          <h3>{t.empty_fridge}</h3>
          <p>Ajoutez un tiroir ou un article pour commencer.</p>
          <button className="btn-add-drawer glass" onClick={() => setIsAddDrawerOpen(true)} style={{ marginTop: '20px' }}>
            <PlusCircle size={18} />
            {t.add_drawer}
          </button>
        </div>
        <AddDrawerModal
          isOpen={isAddDrawerOpen}
          onClose={() => setIsAddDrawerOpen(false)}
          onAdd={addDrawer}
          t={t}
        />
      </>
    );
  }

  return (
    <div className="inventory-list">
      {drawers.map((drawer) => {
        const drawerItems = groupedItems[drawer.name] || [];
        const isCollapsed = collapsedDrawers[drawer.name];
        const isEditingDrawer = editingDrawerId === (drawer.id || drawer.name);

        return (
          <div key={drawer.id || drawer.name} className="drawer-section">
            <div className="items-stack glass">
              <div className="drawer-header" onClick={() => toggleDrawer(drawer.name)}>
                <div className="header-left" style={{ flex: 1 }}>
                  <ChevronRight size={18} className={`chevron ${!isCollapsed ? 'open' : ''}`} />
                  {isEditingDrawer ? (
                    <input 
                      autoFocus
                      className="drawer-rename-input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleSaveDrawerRename(drawer.id || drawer.name, drawer.name)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveDrawerRename(drawer.id || drawer.name, drawer.name);
                        if (e.key === 'Escape') setEditingDrawerId(null);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <h2>{drawer.name}</h2>
                  )}
                  <span className="count">{drawerItems.length}</span>
                </div>
                
                <div className="drawer-header-actions">
                  <button 
                    className="edit-drawer-btn" 
                    onClick={(e) => handleStartEditingDrawer(e, drawer)}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    className="delete-drawer-btn" 
                    onClick={(e) => handleDeleteDrawer(e, drawer.name)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="items-container"
                  >
                    {drawerItems.map(item => (
                      <ItemRow 
                        key={item.id} 
                        item={item} 
                        onClick={setEditingItem}
                        expirationConfig={expirationConfig}
                      />
                    ))}
                    {drawerItems.length === 0 && (
                      <p className="empty-drawer-msg">{t.empty_drawer}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      <div className="drawer-actions">
        <button className="btn-add-drawer glass" onClick={() => setIsAddDrawerOpen(true)}>
          <PlusCircle size={18} />
          {t.add_drawer}
        </button>
      </div>

      <AddDrawerModal
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onAdd={addDrawer}
        t={t}
      />

      <EditItemModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onUpdate={onUpdate}
        onDelete={onDelete}
        drawers={drawers}
        expirationEnabled={expirationConfig?.enabled}
        onAddToList={onAddToList}
        t={t}
      />
    </div>
  );
};

