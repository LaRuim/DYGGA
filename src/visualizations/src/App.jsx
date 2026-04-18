import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { ShortsCanvas } from './pages/ShortsCanvas';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isShortsCanvas = location.pathname.startsWith('/shorts');

  if (isShortsCanvas) {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/shorts/:id" element={<ShortsCanvas />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <TopBar />
      <div className="main-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/liked" element={<Home likedOnly={true} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
