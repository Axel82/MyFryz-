import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Snowflake } from 'lucide-react';

export const AboutModal = ({ isOpen, onClose, language, setLanguage, theme, setTheme, t }) => {
  const themes = [
    { id: 'ice', name: 'Ice', color: '#22d3ee', class: '' },
    { id: 'emerald', name: 'Emerald', color: '#10b981', class: 'theme-emerald' },
    { id: 'midnight', name: 'Midnight', color: '#d946ef', class: 'theme-midnight' },
  ];

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
            initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }} 
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }} 
            exit={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }} 
            className="confirm-modal about-modal glass-dark"
          >
            <div className="modal-header">
              <div className="title-with-icon">
                <Snowflake size={20} className="icon-blue" />
                <h2>{t.about}</h2>
              </div>
              <button onClick={onClose} className="icon-btn"><X size={20} /></button>
            </div>

            <div className="about-content">
              <div className="app-info-box glass">
                <h3>MyFryz' ❄️</h3>
                <p className="version-text">{t.version}</p>
                <p className="about-desc">{t.about_text}</p>
              </div>

              <div className="settings-section">
                <div className="section-title">
                  <Snowflake size={16} />
                  <span>{t.language}</span>
                </div>
                <div className="language-selector">
                  <button 
                    className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
                    onClick={() => setLanguage('fr')}
                  >
                    Français
                  </button>
                  <button 
                    className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                    onClick={() => setLanguage('en')}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="settings-section">
                <div className="section-title">
                  <Snowflake size={16} />
                  <span>{t.theme}</span>
                </div>
                <div className="theme-grid">
                  {themes.map(th => (
                    <button 
                      key={th.id}
                      className={`theme-btn ${theme === th.class ? 'active' : ''}`}
                      onClick={() => setTheme(th.class)}
                      style={{ '--theme-color': th.color }}
                    >
                      <div className="theme-preview" style={{ background: th.color }}>
                        {theme === th.class && <Check size={14} color="#000" />}
                      </div>
                      <span>{th.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={onClose} className="btn-primary full-width" style={{ marginTop: '20px' }}>
              {t.save}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
