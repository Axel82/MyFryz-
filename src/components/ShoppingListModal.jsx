import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, Loader2, Plus, Eye } from 'lucide-react';

export const ShoppingListModal = ({ isOpen, onClose, shoppingList, onAdd, onRemove, onClear, loading, t }) => {
  const [newItemName, setNewItemName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName.trim());
      setNewItemName('');
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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="confirm-modal glass-dark about-modal"
            style={{ top: "50%", left: "50%", maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header" style={{ marginBottom: "20px", flexShrink: 0 }}>
              <div className="title-with-icon">
                <ShoppingCart size={24} className="icon-blue" />
                <h2 style={{ fontSize: "1.2rem", margin: 0, color: "white" }}>{t.shopping_list}</h2>
              </div>
              <button onClick={onClose} className="icon-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="add-task-form" style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder={t.product_name}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="icon-btn" 
                style={{ background: 'var(--accent)', color: '#020617' }}
                disabled={!newItemName.trim()}
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="settings-section" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Loader2 className="animate-spin text-accent" size={24} />
                </div>
              ) : shoppingList.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <p>{t.shopping_list_empty}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {shoppingList.map((item) => (
                    <div 
                      key={item.id} 
                      className="item-row" 
                      style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
                    >
                      <div className="row-content">
                        <div className="title-wrapper">
                          <h3 style={{ margin: 0 }}>{item.name}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {item.barcode && (
                            <button 
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="icon-btn" 
                              style={{ background: 'transparent', color: 'var(--accent, #6366f1)', width: '36px', height: '36px' }}
                              title="View Barcode"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button 
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="icon-btn" 
                            style={{ background: 'transparent', color: '#ef4444', width: '36px', height: '36px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {shoppingList.length > 0 && (
              <div className="confirm-actions" style={{ marginTop: '20px', flexShrink: 0 }}>
                <button 
                  className="btn-cancel" 
                  onClick={onClear} 
                  style={{ width: '100%', color: '#ef4444' }}
                >
                  <Trash2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {t.clear_list}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}

      {selectedItem && (
        <AnimatePresence>
          <> 
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="add-modal glass-dark"
            >
              <div className="modal-header">
                <h2>Barcode</h2>
                <button onClick={() => setSelectedItem(null)} className="icon-btn"><X size={20} /></button>
              </div>
              <div className="modal-content" style={{ padding: '20px' }}>
                <div className="input-group">
                  <label>Product</label>
                  <input type="text" value={selectedItem.name} readOnly disabled style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)' }} />
                </div>
                {selectedItem.barcode && (
                  <div className="input-group">
                    <label>Barcode</label>
                    <input type="text" value={selectedItem.barcode} readOnly disabled style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)' }} />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        </AnimatePresence>
      )}
    </AnimatePresence>
  );
};
