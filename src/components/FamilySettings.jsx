import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, LogOut, CheckCircle2, Loader2, Users } from 'lucide-react';

export const FamilySettings = ({ familyId, createFamily, joinFamily, leaveFamily, itemCount }) => {
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
    <div className="family-settings">
      <div className="section-header">
        <h2>Partage Familial</h2>
        <p>Synchronisez votre congélateur avec vos proches</p>
      </div>

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
            <h3>Mode Solo</h3>
            <p className="description">
              Actuellement, vos données sont stockées uniquement sur cet appareil.
            </p>

            <button 
              className="btn-primary full-width" 
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Créer un groupe familial'}
            </button>

            <div className="divider"><span>OU</span></div>

            <div className="join-group">
              <input 
                type="text" 
                placeholder="Entrez le code de votre famille" 
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button className="btn-secondary" onClick={handleJoin}>
                Rejoindre
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="active-family glass"
          >
            <div className="status-badge">Connecté au Cloud</div>
            <h3>Votre Congélateur Partagé</h3>
            <p className="item-count-sync">{itemCount} articles synchronisés</p>

            <div className="share-box">
              <label>Partagez ce code avec votre famille :</label>
              <div className="code-display" onClick={copyToClipboard}>
                <code>{familyId}</code>
                {copySuccess ? <CheckCircle2 size={18} className="success-icon" /> : <Copy size={18} />}
              </div>
            </div>

            <button className="leave-btn" onClick={leaveFamily}>
              <LogOut size={18} />
              Quitter le groupe
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
