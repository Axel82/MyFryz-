import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Supprimer', isDestructive = true }) => {
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="confirm-modal glass-dark"
          >
            <div className="confirm-icon">
              <Snowflake size={32} color={isDestructive ? '#ef4444' : 'var(--accent)'} />
            </div>
            
            <h3>{title}</h3>
            <p>{message}</p>

            <div className="confirm-actions">
              <button className="btn-cancel" onClick={onClose}>Annuler</button>
              <button 
                className={`btn-confirm ${isDestructive ? 'destructive' : ''}`} 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
