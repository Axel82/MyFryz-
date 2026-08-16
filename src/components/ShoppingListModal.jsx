import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, Loader2, Plus, Eye } from 'lucide-react';

// ---------------------------------------------------------------------------
// Minimal Code128-B encoder (pure JS, no dependency)
// ---------------------------------------------------------------------------
const CODE128_START_B = 104;
const CODE128_STOP    = 106;
const CODE128_WIDTHS  = [
  '11011001100','11001101100','11001100110','10010011000','10010001100',
  '10001001100','10011001000','10011000100','10001100100','11001001000',
  '11001000100','11000100100','10110011100','10011011100','10011001110',
  '10111001100','10011101100','10011100110','11001110010','11001011100',
  '11001001110','11011100100','11001110100','11101101110','11101001100',
  '11100101100','11100100110','11101100100','11100110100','11100110010',
  '11011011000','11011000110','11000110110','10100011000','10001011000',
  '10001000110','10110001000','10001101000','10001100010','11010001000',
  '11000101000','11000100010','10110111000','10110001110','10001101110',
  '10111011000','10111000110','10001110110','11101110110','11010001110',
  '11000101110','11011101000','11011100010','11011101110','11101011000',
  '11101000110','11100010110','11101101000','11101100010','11100011010',
  '11101111010','11001000010','11110001010','10100110000','10100001100',
  '10010110000','10010000110','10000101100','10000100110','10110010000',
  '10110000100','10011010000','10011000010','10000110100','10000110010',
  '11000010010','11001010000','11110111010','11000010100','10001111010',
  '10100111100','10010111100','10010011110','10111100100','10011110100',
  '10011110010','11110100100','11110010100','11110010010','11011011110',
  '11011110110','11110110110','10101111000','10100011110','10001011110',
  '10111101000','10111100010','11110101000','11110100010','10111011110',
  '10111101110','11101011110','11110101110','11010000100','11010010000',
  '11010011100','1100011101011',
];

function encodeCode128(text) {
  let sum = CODE128_START_B;
  const bars = [CODE128_WIDTHS[CODE128_START_B]];
  for (let i = 0; i < text.length; i++) {
    const val = text.charCodeAt(i) - 32;
    sum += val * (i + 1);
    bars.push(CODE128_WIDTHS[val]);
  }
  bars.push(CODE128_WIDTHS[sum % 103]);
  bars.push(CODE128_WIDTHS[CODE128_STOP]);
  return bars.join('') + '11';
}

// ---------------------------------------------------------------------------
// BarcodeCanvas — renders the barcode string into a <canvas>
// ---------------------------------------------------------------------------
const BarcodeCanvas = ({ value }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    const encoded  = encodeCode128(value);
    const canvas   = canvasRef.current;
    const barW     = 2;
    const height   = 80;
    const quietZone = 10;
    canvas.width   = encoded.length * barW + quietZone * 2;
    canvas.height  = height + 24;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < encoded.length; i++) {
      if (encoded[i] === '1') {
        ctx.fillRect(quietZone + i * barW, 0, barW, height);
      }
    }
    ctx.fillStyle = '#555555';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(value, canvas.width / 2, height + 16);
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: '6px', maxWidth: '100%' }}
    />
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const ShoppingListModal = ({ isOpen, onClose, shoppingList, onAdd, onRemove, onClear, loading, t }) => {
  const [newItemName, setNewItemName]   = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName.trim());
      setNewItemName('');
    }
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
            style={{ top: "50%", left: "50%", maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header" style={{ marginBottom: "20px", flexShrink: 0 }}>
              <div className="title-with-icon">
                <ShoppingCart size={24} className="icon-blue" />
                <h2 style={{ fontSize: "1.2rem", margin: 0, color: "white" }}>{t.shopping_list}</h2>
              </div>
              <button onClick={onClose} className="icon-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="add-task-form" style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={t.product_name}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none'
                }}
              />
              <button
                type="submit"
                className="icon-btn"
                style={{ background: 'var(--accent)', color: '#020617' }}
                disabled={!newItemName.trim()}
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="settings-section" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Loader2 className="animate-spin text-accent" size={24} />
                </div>
              ) : shoppingList.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <p>{t.shopping_list_empty}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {shoppingList.map((item) => (
                    <div key={item.id}>
                      <div
                        className="item-row"
                        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: selectedItem?.id === item.id ? '12px 12px 0 0' : '12px' }}
                      >
                        <div className="row-content">
                          <div className="title-wrapper">
                            <h3 style={{ margin: 0 }}>{item.name}</h3>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {item.barcode && (
                              <button
                                type="button"
                                onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                className="icon-btn"
                                style={{
                                  background: selectedItem?.id === item.id
                                    ? 'rgba(99,102,241,0.25)'
                                    : 'transparent',
                                  color: 'var(--accent, #6366f1)',
                                  width: '36px', height: '36px',
                                  transition: 'background 0.2s'
                                }}
                                title="Afficher le code-barres"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onRemove(item.id)}
                              className="icon-btn"
                              style={{ background: 'transparent', color: '#ef4444', width: '36px', height: '36px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Inline barcode panel */}
                      <AnimatePresence>
                        {selectedItem?.id === item.id && item.barcode && (
                          <motion.div
                            key="barcode-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'center',
                              padding: '12px 8px',
                              background: 'rgba(255,255,255,0.04)',
                              borderRadius: '0 0 12px 12px',
                            }}>
                              <BarcodeCanvas value={item.barcode} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {shoppingList.length > 0 && (
              <div className="confirm-actions" style={{ marginTop: '20px', flexShrink: 0 }}>
                <button
                  className="btn-cancel"
                  onClick={onClear}
                  style={{ width: '100%', color: '#ef4444' }}
                >
                  <Trash2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {t.clear_list}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
