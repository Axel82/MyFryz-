import React, { useState, useEffect, useRef } from 'react';
import { Snowflake, LayoutGrid, Plus, Users, Info, Menu, CalendarClock, ShoppingCart } from 'lucide-react';

export const Layout = ({ children, onAddClick, onFamilyClick, onAboutClick, onExpirationClick, onShoppingListClick, t }) => {
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
                  className="dropdown-item"
                  onClick={() => {
                    onFamilyClick();
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
          className="nav-item active"
        >
          <LayoutGrid size={24} />
          <span>{t.stock}</span>
        </button>
        <button className="nav-item add-btn-main" onClick={onAddClick}>
          <div className="plus-bg">
            <Plus size={32} />
          </div>
        </button>
        <button className="nav-item" onClick={onShoppingListClick}>
          <ShoppingCart size={24} />
          <span>{t.shopping_list || "Courses"}</span>
        </button>
      </nav>
    </div>
  );
};
