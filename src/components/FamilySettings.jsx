import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, LogOut, CheckCircle2, Loader2, Users, X } from 'lucide-react';

export const FamilySettings = ({ isOpen, onClose, familyId, createFamily, joinFamily, leaveFamily, itemCount, isCloudEnabled, onOpenCloudConfig, t }) => {
  const [inputCode, setInputCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await createFamily('Ma Famille');
    setLoading(false);
  };

  const handleJoin = () => {
    if (inputCode.trim()) {
      joinFamily(inputCode.trim());
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(familyId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={onClose} />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="config-modal glass-dark" style={{ padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={24} className="icon-blue" />
                <h2 style={{ margin: 0 }}>{t.family_sharing}</h2>
              </div>
              <button onClick={onClose} className="icon-btn"><X size={20} /></button>
            </div>
            
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{t.family_sync_desc}</p>

            <div className="family-settings">
              <AnimatePresence mode="wait">
        {!familyId ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="setup-container glass"
          >
            <div className="icon-circle">
              <Users size={32} />
            </div>
            <h3>{t.solo_mode}</h3>
            <p className="description">
              {t.solo_desc}
            </p>

            {!isCloudEnabled ? (
              <button 
                className="btn-primary full-width" 
                onClick={onOpenCloudConfig}
                style={{ background: 'var(--accent)', color: '#020617', marginTop: '16px' }}
              >
                {t.configure_cloud}
              </button>
            ) : (
              <>
                <button 
                  className="btn-primary full-width" 
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : t.create_family}
                </button>

                <div className="divider"><span>{t.or}</span></div>

                <div className="join-group">
                  <input 
                    type="text" 
                    placeholder={t.enter_family_code}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                  />
                  <button className="btn-secondary" onClick={handleJoin}>
                    {t.join}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="active-family glass"
          >
            <div className="status-badge">{t.connected_cloud}</div>
            <h3>{t.shared_freezer}</h3>
            <p className="item-count-sync">{itemCount} {t.items_synced}</p>

            <div className="share-box">
              <label>{t.share_code}</label>
              <div className="code-display" onClick={copyToClipboard}>
                <code>{familyId}</code>
                {copySuccess ? <CheckCircle2 size={18} className="success-icon" /> : <Copy size={18} />}
              </div>
            </div>

            <button className="leave-btn" onClick={leaveFamily}>
              <LogOut size={18} />
              {t.leave_group}
            </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
  );
};
