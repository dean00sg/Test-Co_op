import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WelcomePage from './pages/WelcomePage';
import CheckInfoUser from './pages/CheckInfoUser';
import CheckLogin from './pages/CheckLogin';
import AddNewsRequest from './pages/AddNews';
import CheckNewsRequest from './pages/CheckNewsRequest';
import './styles.css';

function App() {
  return (
    <Router> {/* Wrap Routes inside Router */}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Home/CheckInfoUser" element={<CheckInfoUser />} />
        <Route path="/Home/CheckLogin" element={<CheckLogin />} />
        <Route path="/Home/AddNewsRequest" element={<AddNewsRequest />} />
        <Route path="/Home/CheckNewsRequest" element={<CheckNewsRequest />} />
      </Routes>
    </Router>
  );
}

export default App;
