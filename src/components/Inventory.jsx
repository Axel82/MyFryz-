import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Trash2, Minus, Plus, ChevronRight, X, PlusCircle } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';
import { ConfirmModal } from './ConfirmModal';

export const ItemCard = ({ item, onUpdate, onDelete }) => {
  const category = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="item-card glass"
    >
      <div className="card-indicator" style={{ backgroundColor: category.color }}></div>
      
      <div className="card-content">
        <div className="card-info">
          <h3>{item.name}</h3>
          <p className="category-label">{category.name}</p>
        </div>

        <div className="card-actions">
          <div className="quantity-controls">
            <button 
              onClick={() => onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })}
              className="qty-btn"
            >
              <Minus size={16} />
            </button>
            <span className="quantity">{item.quantity}</span>
            <button 
              onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
              className="qty-btn"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <button onClick={() => onDelete(item.id)} className="delete-btn">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const InventoryList = ({ items, drawers, onUpdate, onDelete, addDrawer, deleteDrawer }) => {
  const [drawerToDelete, setDrawerToDelete] = useState(null);
  const [isAddingDrawer, setIsAddingDrawer] = useState(false);
  const [newDrawerName, setNewDrawerName] = useState('');

  const groupedItems = items.reduce((acc, item) => {
    const drawer = item.location || 'Sans emplacement';
    if (!acc[drawer]) acc[drawer] = [];
    acc[drawer].push(item);
    return acc;
  }, {});

  const handleDeleteDrawer = (drawerName) => {
    const drawerItems = groupedItems[drawerName] || [];
    if (drawerItems.length > 0) {
      setDrawerToDelete(drawerName);
    } else {
      deleteDrawer(drawerName);
    }
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
        return (
          <div key={drawer.id || drawer.name} className="drawer-section">
            <div className="drawer-header">
              <div className="header-left">
                <ChevronRight size={18} className="chevron" />
                <h2>{drawer.name}</h2>
                <span className="count">{drawerItems.length}</span>
              </div>
              <button 
                className="delete-drawer-btn" 
                onClick={() => handleDeleteDrawer(drawer.name)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <AnimatePresence mode="popLayout">
              {drawerItems.map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onUpdate={onUpdate} 
                  onDelete={onDelete} 
                />
              ))}
              {drawerItems.length === 0 && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 0.4 }} 
                  className="empty-drawer-msg"
                >
                  Ce tiroir est vide
                </motion.p>
              )}
            </AnimatePresence>
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
