import { useState } from 'react';
import Home from './pages/Home';
import Workout from './pages/Workout';
import './App.css'; 

function App() {
  const [activePage, setActivePage] = useState<string>('home');

  return (
    <div className="app-container">
      
      {/* Zona principala care incarca fisierele in functie de stare */}
      <div className="main-area">
        {activePage === 'home' && <Home onNavigate={setActivePage} />}
        {activePage === 'workout' && <Workout onNavigate={setActivePage} />}
      </div>

      {/* Bara de navigare de jos */}
      <div className="bottom-nav">
        <button 
          className={`nav-button ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => setActivePage('home')}
        >
          🏠 Home
        </button>
        
        <button 
          className={`nav-button ${activePage === 'workout' ? 'active' : ''}`}
          onClick={() => setActivePage('workout')}
        >
          ⚡ Workout
        </button>
      </div>

    </div>
  );
}

export default App;