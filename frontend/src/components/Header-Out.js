import React, { useEffect, useState } from 'react'; 
import '../styles/styles_header/outheader.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import the search icon

const Header = () => {
  const [slideTexts, setSlideTexts] = useState([]); // State to hold slide text data
  const [error, setError] = useState(null); // State to hold error message if any

  useEffect(() => {
    // Fetch slide texts from the API
    const fetchSlideTexts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/slideText/slideText/status_show?status_show=show'); // Updated URL
        if (!response.ok) {
          const errorMessage = `Error: ${response.status} ${response.statusText}`; // Log status code
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setSlideTexts(data); // Set the fetched data into state
      } catch (err) {
        setError(err.message); // Set error if any
      }
    };

    fetchSlideTexts(); // Call the fetch function
  }, []);

  return (
    <div>
      <div className="navbarup">
       
      </div>
      <header className="header">
        <h1 className='header_logo'>Tester System </h1>
        <div className="search-bar">
          <input type="text" placeholder="ค้นหา..." />
          <button type="submit">
            <FontAwesomeIcon icon={faSearch} className="icon" />
          </button>
        </div>
      </header>
      <div className="navbardown">
        <ul className="navbardown-list">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
      </div>
      <div className="slideShowText">
        {error ? (
          <span>Error: {error}</span> // Display error if occurred
        ) : (
          slideTexts.map((slideText) => (
            <span key={slideText.slitetext_id}>
              {slideText.detail} {/* Display only the detail */}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default Header;
