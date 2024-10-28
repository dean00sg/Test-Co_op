import React, { useState } from 'react';
import Header from '../components/header/Header-In'; // Import Header
import '../styles/styles_page/CheckInfoUser.css';
import NewsApprove from '../components/check_news_request/NewsToApprove.js'; // Ensure this is the correct file
import LogActionNews from '../components/check_news_request/LogActionNews.js'; // Import the LogActionNews component
import ApproveCard from '../components/check_news_request/AprroveCard.js';

const CheckNewsRequest = () => {
  const [currentTable, setCurrentTable] = useState('approved'); // State for current table

  return (
    <>
      <Header />
      <div className="app">
        <div className='fullpage'>
          <div className="table-switch">
            <h className='pages'>Pages :</h>
            <div>
              <button onClick={() => setCurrentTable('approved')}>Approve Card</button>
              <button onClick={() => setCurrentTable('all')}>All News Page</button>
              <button onClick={() => setCurrentTable('new')}>Check Approve Page</button>
              <button onClick={() => setCurrentTable('Log')}>Check Log Action News Page</button>
            </div>
          </div>
          <div className="form-fixcard">
            {currentTable === 'approved' ? ( // Render ApproveCard when currentTable is 'approved'
              <ApproveCard />
            ) : currentTable === 'Log' ? (
              <LogActionNews />
            ) : (
              <NewsApprove currentTable={currentTable} /> // Pass currentTable as a prop
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckNewsRequest;
