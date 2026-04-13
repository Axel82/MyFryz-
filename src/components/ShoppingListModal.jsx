import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, Loader2 } from 'lucide-react';

export const ShoppingListModal = ({ isOpen, onClose, shoppingList, onRemove, onClear, loading, t }) => {
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
                          <h3>{item.name}</h3>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)} 
                          className="icon-btn" 
                          style={{ background: 'transparent', color: '#ef4444', width: '36px', height: '36px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {shoppingList.length > 0 && (
              <div className="confirm-actions" style={{ marginTop: '30px', flexShrink: 0 }}>
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
    </AnimatePresence>
  );
};
