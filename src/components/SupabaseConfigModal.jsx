import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, CheckCircle2, XCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testSupabaseConnection } from '../supabase';

export const SupabaseConfigModal = ({ isOpen, onClose, t }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | { ok, message }
  const hasExisting = !!getSupabaseConfig().url;

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url || '');
      setKey(cfg.key || '');
      setTestResult(null);
    }
  }, [isOpen]);

  const handleTest = async () => {
    if (!url.trim() || !key.trim()) return;
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, key);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, key);
    // page will reload
  };

  const handleClear = () => {
    if (confirm(t.supabase_clear_confirm)) {
      clearSupabaseConfig();
      // page will reload
    }
  };

  const isValid = url.startsWith('https://') && key.length > 20;

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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="add-modal glass-dark"
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={20} className="icon-blue" />
                <h2>{t.supabase_config_title}</h2>
              </div>
              <button onClick={onClose} className="icon-btn"><X size={20} /></button>
            </div>

            <div className="add-form" style={{ gap: '16px' }}>
              {/* Explainer */}
              <div className="app-info-box glass" style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t.supabase_explainer}
                </p>
                <a
                  href="https://supabase.com/dashboard/projects"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  supabase.com <ExternalLink size={12} />
                </a>
              </div>

              {/* URL Field */}
              <div className="input-group">
                <label>{t.supabase_url}</label>
                <input
                  type="url"
                  placeholder="https://xxxx.supabase.co"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setTestResult(null); }}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              {/* Anon Key Field */}
              <div className="input-group">
                <label>{t.supabase_anon_key}</label>
                <input
                  type="password"
                  placeholder="eyJhbGci..."
                  value={key}
                  onChange={e => { setKey(e.target.value); setTestResult(null); }}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              {/* Test result */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                    borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                    background: testResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: testResult.ok ? '#22c55e' : '#ef4444',
                    border: `1px solid ${testResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}
                >
                  {testResult.ok
                    ? <><CheckCircle2 size={16} /> {t.supabase_test_ok}</>
                    : <><XCircle size={16} /> {testResult.message || t.supabase_test_fail}</>
                  }
                </motion.div>
              )}

              {/* Actions */}
              <button
                type="button"
                onClick={handleTest}
                disabled={!isValid || testing}
                className="btn-primary"
                style={{ width: '100%', background: 'rgba(34,211,238,0.15)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
              >
                {testing ? <Loader2 size={16} className="animate-spin" style={{ marginRight: 6 }} /> : null}
                {testing ? t.supabase_testing : t.supabase_test_btn}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid || testing}
                className="btn-primary submit-btn"
                style={{ width: '100%' }}
              >
                {t.save} &amp; Relancer
              </button>

              {hasExisting && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', color: '#ef4444', opacity: 0.7, fontSize: '0.85rem' }}
                >
                  <Trash2 size={14} />
                  {t.supabase_clear_btn}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
