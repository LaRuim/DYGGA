import { Home, Compass, Bookmark, Activity, Heart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <div className="sidebar">
      <NavLink
        to="/"
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      >
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/shorts/1"
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      >
        <Compass size={24} />
        <span>Shorts</span>
      </NavLink>
      <div className="sidebar-item">
        <Bookmark size={24} />
        <span>Saved</span>
      </div>
      <div className="sidebar-item">
        <Activity size={24} />
        <span>History</span>
      </div>
      <NavLink
        to="/liked"
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      >
        <Heart size={24} />
        <span>Liked</span>
      </NavLink>
    </div>
  );
}
