import { Snowflake, LayoutGrid, Plus, Users, Info } from 'lucide-react';

export const Layout = ({ children, onAddClick, activeTab, onTabChange, onAboutClick }) => {
  return (
    <div className="layout">
      <header className="header glass-dark">
        <div className="header-content">
          <div className="logo">
            <Snowflake className="icon-blue" size={28} />
            <h1>MyFryz'</h1>
          </div>
          <button className="icon-btn search-btn" onClick={onAboutClick}>
            <Info size={20} />
          </button>
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
          <span>Stock</span>
        </button>
        <button className="nav-item add-btn-main" onClick={onAddClick}>
          <div className="plus-bg">
            <Plus size={32} />
          </div>
        </button>
        <button 
          className={`nav-item ${activeTab === 'family' ? 'active' : ''}`}
          onClick={() => onTabChange('family')}
        >
          <Users size={24} />
          <span>Famille</span>
        </button>
      </nav>
    </div>
  );
};
