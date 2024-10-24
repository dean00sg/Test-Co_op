import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WelcomePage from './pages/WelcomePage';
import CheckInfoUser from './pages/CheckInfoUser';
import './styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Home/CheckInfoUser" element={<CheckInfoUser />} />
        
      </Routes>
    </Router>
  );
}

export default App;