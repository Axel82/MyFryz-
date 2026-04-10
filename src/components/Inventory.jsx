import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Trash2, Minus, Plus, ChevronRight, X, PlusCircle, Edit3 } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';
import { EditItemModal } from './EditItemModal';

export const ItemRow = ({ item, onClick }) => {
  const category = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

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

export const InventoryList = ({ items, drawers, onUpdate, onDelete, addDrawer, deleteDrawer, updateDrawer, t }) => {
  const [drawerToDelete, setDrawerToDelete] = useState(null);
  const [isAddingDrawer, setIsAddingDrawer] = useState(false);
  const [newDrawerName, setNewDrawerName] = useState('');
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

  const handleCreateDrawer = () => {
    if (newDrawerName.trim()) {
      addDrawer(newDrawerName.trim());
      setNewDrawerName('');
      setIsAddingDrawer(false);
    }
  };

  if (drawers.length === 0 && items.length === 0) {
    return (
      <div className="empty-state">
        <Package size={48} className="empty-icon" />
        <h3>{t.empty_fridge}</h3>
        <p>Ajoutez un tiroir ou un article pour commencer.</p>
        
        {isAddingDrawer ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="add-drawer-form glass" style={{ marginTop: '20px' }}>
            <input 
              autoFocus 
              value={newDrawerName} 
              onChange={e => setNewDrawerName(e.target.value)}
              placeholder={t.add_drawer}
              onKeyDown={e => e.key === 'Enter' && handleCreateDrawer()}
            />
            <div className="form-buttons">
              <button onClick={() => setIsAddingDrawer(false)} className="icon-btn-small"><X size={16} /></button>
              <button onClick={handleCreateDrawer} className="icon-btn-small active"><Plus size={16} /></button>
            </div>
          </motion.div>
        ) : (
          <button className="btn-add-drawer glass" onClick={() => setIsAddingDrawer(true)} style={{ marginTop: '20px' }}>
              <PlusCircle size={18} />
              {t.add_drawer}
          </button>
        )}
      </div>
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
                      />
                    ))}
                    {drawerItems.length === 0 && (
                      <p className="empty-drawer-msg">Ce tiroir est vide</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      <div className="drawer-actions">
        {isAddingDrawer ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="add-drawer-form glass">
            <input 
              autoFocus 
              value={newDrawerName} 
              onChange={e => setNewDrawerName(e.target.value)}
              placeholder="Nom du tiroir (ex: Viandes)"
              onKeyDown={e => e.key === 'Enter' && handleCreateDrawer()}
            />
            <div className="form-buttons">
              <button onClick={() => setIsAddingDrawer(false)} className="icon-btn-small"><X size={16} /></button>
              <button onClick={handleCreateDrawer} className="icon-btn-small active"><Plus size={16} /></button>
            </div>
          </motion.div>
        ) : (
          <button className="btn-add-drawer glass" onClick={() => setIsAddingDrawer(true)}>
            <PlusCircle size={18} />
            Ajouter un tiroir
          </button>
        )}
      </div>

      <EditItemModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onUpdate={onUpdate}
        onDelete={onDelete}
        drawers={drawers}
      />
    </div>
  );
};
