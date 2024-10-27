import React, { useEffect, useState } from 'react';
import './inheader.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faHome } from '@fortawesome/free-solid-svg-icons'; // Import the home icon
import { useLocation } from 'react-router-dom'; // Import useLocation

const Header = () => {
  const location = useLocation(); // Get the current location
  const [slideTexts, setSlideTexts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlideTexts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/slideText/slideText/status_show?status_show=show');
        if (!response.ok) {
          const errorMessage = `Error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setSlideTexts(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSlideTexts();
  }, []);

  return (
    <div>
      <div className="navbarup">
        {/* Optionally, add content to the top navbar here */}
      </div>
      <header className="header">
        <h1 className='header_logo'>Tester System</h1>
        <div className="search-bar">
          <input type="text" placeholder="ค้นหา..." />
          <button type="submit">
            <FontAwesomeIcon icon={faSearch} className="icon" />
          </button>
        </div>
      </header>
      <div className="navbardown">
        <div className="current-path">
          <FontAwesomeIcon icon={faHome} style={{ marginRight: '8px' }} /> 
          Stay In Page: {location.pathname} 
        </div>
        <ul className="navbardown-list">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
      <div className="slideShowText">
        {error ? (
          <span>Error: {error}</span>
        ) : (
          slideTexts.map((slideText) => (
            <span key={slideText.slitetext_id}>
              {slideText.detail}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default Header;
