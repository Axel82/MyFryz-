import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarClock } from 'lucide-react';
import { useExpirationConfig } from '../hooks/useExpirationConfig';

export const ExpirationConfigModal = ({ isOpen, onClose, config, setConfig, t }) => {
  const handleToggle = () => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleLevel1Change = (e) => {
    setConfig(prev => ({ ...prev, level1Months: parseInt(e.target.value) || 0 }));
  };

  const handleLevel2Change = (e) => {
    setConfig(prev => ({ ...prev, level2Months: parseInt(e.target.value) || 0 }));
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
            style={{ top: "50%", left: "50%" }}
          >
            <div className="modal-header" style={{ marginBottom: "20px" }}>
              <div className="title-with-icon">
                <CalendarClock size={24} className="icon-blue" />
                <h2 style={{ fontSize: "1.2rem", margin: 0, color: "white" }}>{t.expiration_title}</h2>
              </div>
              <button onClick={onClose} className="icon-btn">
                <X size={20} />
              </button>
            </div>

            <div className="settings-section">
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                <input 
                  type="checkbox" 
                  checked={config.enabled} 
                  onChange={handleToggle} 
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
                />
                <span style={{ color: 'white', fontWeight: 600 }}>{t.expiration_enable}</span>
              </label>

              {config.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="input-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                      {t.expiration_level_1}
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      value={config.level1Months} 
                      onChange={handleLevel1Change}
                      style={{ 
                        width: '100%', padding: '10px', borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white'
                      }}
                    />
                    <small style={{ color: '#eab308', display: 'block', marginTop: '4px' }}>
                      ● {t.expiration_level_1_desc}
                    </small>
                  </div>

                  <div className="input-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                      {t.expiration_level_2}
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      value={config.level2Months} 
                      onChange={handleLevel2Change}
                      style={{ 
                        width: '100%', padding: '10px', borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white'
                      }}
                    />
                    <small style={{ color: '#ef4444', display: 'block', marginTop: '4px' }}>
                      ● {t.expiration_level_2_desc}
                    </small>
                  </div>
                </div>
              )}
            </div>
            
            <div className="confirm-actions" style={{ marginTop: '30px' }}>
              <button className="btn-confirm" onClick={onClose} style={{ width: '100%' }}>
                {t.save}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
