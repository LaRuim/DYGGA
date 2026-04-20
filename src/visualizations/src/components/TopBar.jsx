import { Search, Menu, Bell, Video, User, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="icon-btn">
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="logo">
            <BarChart2 size={24} color="#f00" />
            DyggaPipe
          </div>
          <span style={{ fontSize: '0.65rem', color: '#888', marginTop: '-4px' }}>Not affiliated with YouTube</span>
        </div>
      </div>

      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search Visualizations" />
        <button className="search-btn">
          <Search size={20} color="#f1f1f1" />
        </button>
      </div>

      <div className="topbar-right">
        <Link to="/sandbox" className="icon-btn">
          <Video size={24} />
        </Link>
        <button className="icon-btn">
          <Bell size={24} />
        </button>
        <div className="profile-avatar">
          <User size={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}
