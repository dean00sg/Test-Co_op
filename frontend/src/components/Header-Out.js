import React from 'react';
import '../styles/header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import the search icon

const Header = () => {
  return (
    <div>
      <div className="navbarup">
       
       </div>
      <header className="header">
        
        <h1>Tester System </h1>
        
          <div className="search-bar">
            <input type="text" placeholder="ค้นหา..." />
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} className="icon" />
            </button>
         
        </div>
      </header>
      <div className="navbardown">
       
      </div>
      <div className="slideShowText">
        <span>
          This will keep your sections centered on mobile devices while maintaining their responsive design. 
          The response will now contain lists of all login and logout records for the specified user, ordered by their IDs. 
          If you want to limit the number of entries returned or include specific fields in the response, you can further adjust the code as needed.
        </span>
      </div>
    </div>
  );
};

export default Header;
