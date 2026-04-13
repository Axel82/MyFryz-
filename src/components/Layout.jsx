import React, { useState, useEffect, useRef } from 'react';
import { Snowflake, LayoutGrid, Plus, Users, Info, Menu, CalendarClock } from 'lucide-react';

export const Layout = ({ children, onAddClick, activeTab, onTabChange, onAboutClick, onExpirationClick, t }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="layout">
      <header className="header glass-dark">
        <div className="header-content">
          <div className="logo">
            <Snowflake className="icon-blue" size={28} />
            <h1>MyFryz'</h1>
          </div>
          <div className="menu-container" ref={menuRef} style={{ position: 'relative' }}>
            <button className="icon-btn search-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={20} />
            </button>
            
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button 
                  className={`dropdown-item ${activeTab === 'family' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('family');
                    setIsMenuOpen(false);
                  }}
                >
                  <Users size={18} />
                  <span>{t.family}</span>
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    onExpirationClick();
                    setIsMenuOpen(false);
                  }}
                >
                  <CalendarClock size={18} />
                  <span>{t.expiration_title}</span>
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    onAboutClick();
                    setIsMenuOpen(false);
                  }}
                >
                  <Info size={18} />
                  <span>{t.about}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav glass">
        <button 
          className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => onTabChange('stock')}
        >
          <LayoutGrid size={24} />
          <span>{t.stock}</span>
        </button>
        <button className="nav-item add-btn-main" onClick={onAddClick}>
          <div className="plus-bg">
            <Plus size={32} />
          </div>
        </button>
        <div className="nav-item" style={{ visibility: 'hidden', pointerEvents: 'none' }}>
          <LayoutGrid size={24} />
          <span>{t.stock}</span>
        </div>
      </nav>
    </div>
  );
};
