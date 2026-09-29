import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ScanBarcode, Loader2, AlertCircle, Layers, Plus } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';

const Scanner = ({ onScan, onClose }) => {
  const scannerRef = React.useRef(null);
  const isStoppingRef = React.useRef(false);
  const [scannerError, setScannerError] = useState(null);

  const handleStop = React.useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

    const startScanner = async () => {
      // Small delay to ensure container is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            onScan(decodedText);
            handleStop();
          }
        );
      } catch (err) {
        console.error("Scanner start error:", err);
        setScannerError(err.message || "Erreur caméra");
      }
    };

    startScanner();

    return () => {
      // Emergency stop on unmount if not already stopping
      if (scannerRef.current && !isStoppingRef.current) {
        const instance = scannerRef.current;
        if (instance.isScanning) {
          instance.stop().catch(() => {
            // Fallback: forcefully stop all video tracks
            const video = document.querySelector('#reader video');
            if (video && video.srcObject) {
              video.srcObject.getTracks().forEach(track => track.stop());
            }
          });
        }
      }
    };
  }, [onScan, handleStop]);

  return (
    <div className="scanner-container">
      <div className="scanner-box">
        {scannerError ? (
          <div className="scanner-error">
            <AlertCircle size={40} />
            <p>{scannerError}</p>
            <button onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <>
            <div id="reader"></div>
            <div className="scanner-overlay"></div>
          </>
        )}
      </div>
      <button onClick={handleStop} className="close-scanner">
        Annuler le scan
      </button>
    </div>
  );
};

export const AddItemModal = ({ isOpen, onClose, onAdd, onUpdate, items = [], getItemSuggestions, drawers, expirationEnabled, t }) => {
  const [formData, setFormData] = useState({
    name: '',
    barcode: null,
    category: 'autres',
    location: '',
    quantity: 1,
    weight: 0,
    item_date: new Date().toISOString().split('T')[0]
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateState, setDuplicateState] = useState(null);

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: null,
      category: 'autres',
      location: '',
      quantity: 1,
      weight: 0,
      item_date: new Date().toISOString().split('T')[0]
    });
    setDuplicateState(null);
    setError('');
  };

  const handleScan = async (barcode) => {
    setIsLoading(true);
    setError('');
    const suggestions = await getItemSuggestions(barcode);
    if (suggestions) {
      setFormData(prev => ({ ...prev, name: suggestions.name, barcode }));
      setIsScanning(false);
    } else {
      // Produit non trouvé dans OpenFoodFacts : on garde quand même le barcode
      setFormData(prev => ({ ...prev, barcode }));
      setError('Produit non trouvé. Vous pouvez saisir le nom manuellement.');
      setIsScanning(false);
    }
    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = formData.name?.trim();
    if (!trimmedName || !formData.location) return;

    // Check if an item with the same name or barcode already exists
    const matches = (items || []).filter(
      it => (it.name && it.name.trim().toLowerCase() === trimmedName.toLowerCase()) ||
            (formData.barcode && it.barcode && String(it.barcode).trim() === String(formData.barcode).trim())
    );

    if (matches.length > 0) {
      const matchSameLocation = matches.find(m => m.location === formData.location);
      const defaultMatch = matchSameLocation || matches[0];
      setDuplicateState({
        matches,
        selectedId: defaultMatch.id
      });
      return;
    }

    onAdd(formData);
    resetForm();
    onClose();
  };

  const handleAddToExisting = () => {
    if (!duplicateState) return;
    const targetItem = duplicateState.matches.find(m => m.id === duplicateState.selectedId) || duplicateState.matches[0];
    if (!targetItem) return;

    const currentQty = Number(targetItem.quantity) || 1;
    const addQty = Number(formData.quantity) || 1;
    const currentWeight = Number(targetItem.weight) || 0;
    const addWeight = Number(formData.weight) || 0;

    const updates = {
      quantity: currentQty + addQty,
      ...(currentWeight > 0 || addWeight > 0 ? { weight: currentWeight + addWeight } : {}),
      ...(formData.barcode && !targetItem.barcode ? { barcode: formData.barcode } : {})
    };

    if (onUpdate) {
      onUpdate(targetItem.id, updates);
    }
    resetForm();
    onClose();
  };

  const handleCreateNew = () => {
    onAdd(formData);
    resetForm();
    onClose();
  };

  const handleCancelDuplicate = () => {
    setDuplicateState(null);
  };

  const handleCloseAll = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={handleCloseAll} />
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="add-modal glass-dark"
          >
            <div className="modal-header">
              <h2>{t.add_item}</h2>
              <button onClick={handleCloseAll} className="icon-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
              {error && (
                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <div className="input-group">
                <label>{t.product_name}</label>
                <div className="scan-wrapper">
                  <input 
                    type="text" 
                    placeholder="Nom du produit" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setIsScanning(true)} className="icon-btn scan-btn" disabled={isLoading}>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ScanBarcode size={20} />}
                  </button>
                </div>
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
                  <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required>
                    <option value="">{t.choose}</option>
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

              <button type="submit" className="btn-primary submit-btn">
                {t.add_item}
              </button>
            </form>

            <AnimatePresence>
              {isScanning && <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
            </AnimatePresence>

            {/* Popup confirmation item existant */}
            <AnimatePresence>
              {duplicateState && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay duplicate-overlay"
                    onClick={handleCancelDuplicate}
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="duplicate-modal glass-dark"
                  >
                    <div className="duplicate-icon">
                      <Layers size={32} />
                    </div>

                    <h3>{t.duplicate_item_title || "Article déjà existant"}</h3>
                    <p className="duplicate-desc">
                      {(t.duplicate_item_desc || "Un article nommé « {name} » existe déjà dans votre inventaire.").replace('{name}', formData.name.trim())}
                    </p>

                    {duplicateState.matches.length > 1 && (
                      <div className="duplicate-selector-group">
                        <label>{t.duplicate_select_target || "Sélectionnez l'article à modifier :"}</label>
                        <select
                          value={duplicateState.selectedId}
                          onChange={(e) => setDuplicateState(prev => ({ ...prev, selectedId: e.target.value }))}
                          className="duplicate-select"
                        >
                          {duplicateState.matches.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.location} — Qté: x{m.quantity}{m.weight ? ` (${m.weight}g)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(() => {
                      const target = duplicateState.matches.find(m => m.id === duplicateState.selectedId) || duplicateState.matches[0];
                      if (!target) return null;
                      const currQty = Number(target.quantity) || 1;
                      const newQty = currQty + (Number(formData.quantity) || 1);
                      const currW = Number(target.weight) || 0;
                      const newW = currW + (Number(formData.weight) || 0);

                      return (
                        <div className="duplicate-preview-card glass">
                          <div className="duplicate-preview-header">
                            <span className="duplicate-location-tag">📍 {target.location}</span>
                          </div>
                          <div className="duplicate-qty-calc">
                            <div className="qty-col">
                              <span className="qty-label">{t.duplicate_current_qty || "Actuel"}</span>
                              <span className="qty-value">x{currQty}{currW > 0 ? ` (${currW}g)` : ''}</span>
                            </div>
                            <div className="qty-arrow">➔</div>
                            <div className="qty-col highlighted">
                              <span className="qty-label">{t.duplicate_new_qty || "Nouveau total"}</span>
                              <span className="qty-value">x{newQty}{newW > 0 ? ` (${newW}g)` : ''}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="duplicate-actions">
                      <button
                        type="button"
                        className="btn-primary duplicate-add-btn"
                        onClick={handleAddToExisting}
                      >
                        <Layers size={18} />
                        {t.add_to_existing || "Ajouter à l'existant"}
                      </button>

                      <button
                        type="button"
                        className="duplicate-new-btn"
                        onClick={handleCreateNew}
                      >
                        <Plus size={18} />
                        {t.create_new_item || "Créer un nouvel article"}
                      </button>

                      <button
                        type="button"
                        className="btn-cancel duplicate-cancel-btn"
                        onClick={handleCancelDuplicate}
                      >
                        {t.cancel || "Annuler"}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
