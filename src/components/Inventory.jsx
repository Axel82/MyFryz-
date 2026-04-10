import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Trash2, Minus, Plus, ChevronRight, X, PlusCircle, Edit3 } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';
import { ConfirmModal } from './ConfirmModal';

export const ItemRow = ({ item, onUpdate, onDelete }) => {
  const category = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="item-row"
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
          <div className="qty-minimal">
            <button 
              onClick={() => onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })}
              className="qty-btn-mini"
            >
              <Minus size={12} />
            </button>
            <span className="qty-val">{item.quantity}</span>
            <button 
              onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
              className="qty-btn-mini"
            >
              <Plus size={12} />
            </button>
          </div>
          
          <button onClick={() => onDelete(item.id)} className="delete-btn">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const InventoryList = ({ items, drawers, onUpdate, onDelete, addDrawer, deleteDrawer, updateDrawer }) => {
  const [drawerToDelete, setDrawerToDelete] = useState(null);
  const [isAddingDrawer, setIsAddingDrawer] = useState(false);
  const [newDrawerName, setNewDrawerName] = useState('');
  const [collapsedDrawers, setCollapsedDrawers] = useState({});
  const [editingDrawerId, setEditingDrawerId] = useState(null);
  const [editName, setEditName] = useState('');

  const toggleDrawer = (drawerName) => {
    // Prevent toggle when clicking icons
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
      setDrawerToDelete(drawerName);
    } else {
      deleteDrawer(drawerName);
    }
  };

  const handleStartEditing = (e, drawer) => {
    e.stopPropagation();
    setEditingDrawerId(drawer.id || drawer.name);
    setEditName(drawer.name);
  };

  const handleSaveRename = (drawerId, oldName) => {
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
        <h3>Le congélateur est vide</h3>
        <p>Ajoutez un tiroir ou un article pour commencer.</p>
        
        {isAddingDrawer ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="add-drawer-form glass" style={{ marginTop: '20px' }}>
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
          <button className="btn-add-drawer glass" onClick={() => setIsAddingDrawer(true)} style={{ marginTop: '20px' }}>
              <PlusCircle size={18} />
              Ajouter mon premier tiroir
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
        const isEditing = editingDrawerId === (drawer.id || drawer.name);

        return (
          <div key={drawer.id || drawer.name} className="drawer-section">
            <div className="items-stack glass">
              <div className="drawer-header" onClick={() => toggleDrawer(drawer.name)}>
                <div className="header-left" style={{ flex: 1 }}>
                  <ChevronRight size={18} className={`chevron ${!isCollapsed ? 'open' : ''}`} />
                  {isEditing ? (
                    <input 
                      autoFocus
                      className="drawer-rename-input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleSaveRename(drawer.id || drawer.name, drawer.name)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveRename(drawer.id || drawer.name, drawer.name);
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
                    onClick={(e) => handleStartEditing(e, drawer)}
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
                        onUpdate={onUpdate} 
                        onDelete={onDelete} 
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

      <ConfirmModal 
        isOpen={!!drawerToDelete}
        onClose={() => setDrawerToDelete(null)}
        onConfirm={() => deleteDrawer(drawerToDelete)}
        title="Supprimer le tiroir ?"
        message={`Ce tiroir contient ${groupedItems[drawerToDelete]?.length || 0} article(s). Tout son contenu sera définitivement supprimé.`}
      />
    </div>
  );
};
