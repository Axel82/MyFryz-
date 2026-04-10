import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';

export const EditItemModal = ({ isOpen, onClose, item, onUpdate, onDelete, drawers }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'autres',
    location: '',
    quantity: 1,
    weight: 0
  });

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || '',
        category: item.category || 'autres',
        location: item.location || '',
        quantity: item.quantity || 1,
        weight: item.weight || 0
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(item.id, formData);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Supprimer ${formData.name} ?`)) {
      onDelete(item.id);
      onClose();
    }
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
              <h2>Modifier l'article</h2>
              <button onClick={onClose} className="icon-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
              <div className="input-group">
                <label>Nom du produit</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid-row">
                <div className="input-group">
                  <label>Catégorie</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Emplacement (Tiroir)</label>
                  <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}>
                    {drawers.map(dr => <option key={dr.id || dr.name} value={dr.name}>{dr.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-row">
                <div className="input-group">
                  <label>Quantité</label>
                  <div className="quantity-selector">
                    <button type="button" onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}>-</button>
                    <span>{formData.quantity}</span>
                    <button type="button" onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}>+</button>
                  </div>
                </div>
                <div className="input-group">
                  <label>Poids (grammes)</label>
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
                  Supprimer
                </button>
                <button type="submit" className="btn-primary submit-btn flex-1">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
