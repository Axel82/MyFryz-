import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';

export const EditItemModal = ({ isOpen, onClose, item, onUpdate, onDelete, drawers, expirationEnabled, onAddToList, t }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'autres',
    location: '',
    quantity: 1,
    weight: 0,
    item_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (item && isOpen) {
      setIsConfirmingDelete(false);
      setFormData({
        name: item.name || '',
        category: item.category || 'autres',
        location: item.location || '',
        quantity: item.quantity || 1,
        weight: item.weight || 0,
        item_date: item.item_date || new Date().toISOString().split('T')[0]
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(item.id, formData);
    onClose();
  };

  const handleDelete = () => {
    setIsConfirmingDelete(true);
  };

  const confirmDeleteOnly = () => {
    onDelete(item.id);
    setIsConfirmingDelete(false);
    onClose();
  };

  const confirmDeleteAndAdd = () => {
    onDelete(item.id);
    if (onAddToList) onAddToList(formData.name);
    setIsConfirmingDelete(false);
    onClose();
  };

  if (!item) return null;

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
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
            className="add-modal edit-modal glass-dark"
          >
            <div className="modal-header">
              <h2>{isConfirmingDelete ? t.delete : t.about}</h2>
              <button 
                onClick={() => { setIsConfirmingDelete(false); onClose(); }} 
                className="icon-btn"
              >
                <X size={20} />
              </button>
            </div>

            {isConfirmingDelete ? (
              <div className="delete-confirmation-state" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0 20px 0' }}>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {t.delete_item_prompt || "Que souhaitez-vous faire avec cet élément ?"}
                </p>
                <button 
                  onClick={confirmDeleteAndAdd} 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <ShoppingCart size={18} />
                  {t.delete_and_add || "Supprimer & Ajouter aux courses"}
                </button>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={confirmDeleteOnly} 
                    className="btn-delete-full flex-1" 
                    style={{ margin: 0, padding: '14px' }}
                  >
                    <Trash2 size={18} />
                    {t.delete_only || "Supprimer"}
                  </button>
                  <button 
                    onClick={() => setIsConfirmingDelete(false)} 
                    className="btn-cancel flex-1"
                    style={{ padding: '14px', borderRadius: '12px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {t.cancel || "Annuler"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="add-form">
              <div className="input-group">
                <label>{t.product_name}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid-row">
                <div className="input-group">
                  <label>{t.category}</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{t[cat.id] || cat.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>{t.location}</label>
                  <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}>
                    {drawers.map(dr => <option key={dr.id || dr.name} value={dr.name}>{dr.name}</option>)}
                  </select>
                </div>
              </div>

              {expirationEnabled && (
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label>{t.freeze_date || "Date de congélation"}</label>
                  <input 
                    type="date" 
                    value={formData.item_date}
                    onChange={e => setFormData({ ...formData, item_date: e.target.value })}
                  />
                </div>
              )}

              <div className="grid-row">
                <div className="input-group">
                  <label>{t.quantity}</label>
                  <div className="quantity-selector">
                    <button type="button" onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}>-</button>
                    <span>{formData.quantity}</span>
                    <button type="button" onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}>+</button>
                  </div>
                </div>
                <div className="input-group">
                  <label>{t.weight}</label>
                  <div className="quantity-selector weight-selector">
                    <button type="button" onClick={() => setFormData({ ...formData, weight: Math.max(0, (formData.weight || 0) - 100) })}>-</button>
                    <span>{formData.weight || 0}g</span>
                    <button type="button" onClick={() => setFormData({ ...formData, weight: (formData.weight || 0) + 100 })}>+</button>
                  </div>
                </div>
              </div>

              <div className="edit-modal-actions">
                <button type="button" onClick={handleDelete} className="btn-delete-full">
                  <Trash2 size={18} />
                  {t.delete}
                </button>
                <button type="submit" className="btn-primary submit-btn flex-1">
                  {t.save}
                </button>
              </div>
            </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
