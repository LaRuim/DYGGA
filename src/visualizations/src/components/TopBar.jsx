import { Search, Menu, Bell, Video, User } from 'lucide-react';

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="icon-btn">
          <Menu size={24} />
        </button>
        <div className="logo">
          <svg height="24" viewBox="0 0 24 24" width="24" fill="red"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          DVA Tube
        </div>
      </div>
      
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search Visualizations" />
        <button className="search-btn">
          <Search size={20} color="#f1f1f1" />
        </button>
      </div>

      <div className="topbar-right">
        <button className="icon-btn">
          <Video size={24} />
        </button>
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
