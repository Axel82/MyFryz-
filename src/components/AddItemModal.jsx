import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scan, Loader2, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../hooks/useInventory';

const Scanner = ({ onScan, onClose }) => {
  const scannerRef = React.useRef(null);
  const isStoppingRef = React.useRef(false);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

    const startScanner = async () => {
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
      }
    };

    startScanner();

    return () => {
      // Emergency stop on unmount if not already stopping
      if (scannerRef.current && !isStoppingRef.current) {
        const instance = scannerRef.current;
        if (instance.isScanning) {
          instance.stop().then(() => instance.clear()).catch(() => {
            // Fallback: forcefully stop all video tracks
            const video = document.querySelector('#reader video');
            if (video && video.srcObject) {
              video.srcObject.getTracks().forEach(track => track.stop());
            }
          });
        }
      }
    };
  }, [onScan]);

  const handleStop = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Scanner stop warning:", err);
        // Manual track termination fallback
        const video = document.querySelector('#reader video');
        if (video && video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    }
    onClose();
  };

  return (
    <div className="scanner-container">
      <div className="scanner-box">
        <div id="reader"></div>
        <div className="scanner-overlay"></div>
      </div>
      <button onClick={handleStop} className="close-scanner">
        Annuler le scan
      </button>
    </div>
  );
};

export const AddItemModal = ({ isOpen, onClose, onAdd, getItemSuggestions, drawers, t }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'autres',
    location: '',
    quantity: 1,
    weight: 0
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (barcode) => {
    setIsLoading(true);
    const suggestions = await getItemSuggestions(barcode);
    if (suggestions) {
      setFormData({ ...formData, name: suggestions.name });
      setIsScanning(false);
    } else {
      setError('Produit non trouvé');
    }
    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;
    onAdd(formData);
    setFormData({ name: '', category: 'autres', location: '', quantity: 1, weight: 0 });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={onClose} />
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="add-modal glass-dark"
          >
            <div className="modal-header">
              <h2>{t.add_item}</h2>
              <button onClick={onClose} className="icon-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
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
                  <button type="button" onClick={() => setIsScanning(true)} className="icon-btn scan-btn">
                    <Scan size={20} />
                  </button>
                </div>
              </div>

              <div className="grid-row">
                <div className="input-group">
                  <label>{t.category}</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>{t.location}</label>
                  <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required>
                    <option value="">-- Choisir --</option>
                    {drawers.map(dr => <option key={dr.id || dr.name} value={dr.name}>{dr.name}</option>)}
                  </select>
                </div>
              </div>

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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
