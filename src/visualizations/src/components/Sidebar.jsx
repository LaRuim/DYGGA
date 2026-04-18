import { Home, Flame, PlaySquare, Clock, ThumbsUp } from 'lucide-react';
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
        <Flame size={24} />
        <span>Shorts Canvas</span>
      </NavLink>
      <div className="sidebar-item">
        <PlaySquare size={24} />
        <span>Subscriptions</span>
      </div>
      <div className="sidebar-item">
        <Clock size={24} />
        <span>History</span>
      </div>
      <NavLink 
        to="/liked" 
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
      >
        <ThumbsUp size={24} />
        <span>Liked</span>
      </NavLink>
    </div>
  );
}
