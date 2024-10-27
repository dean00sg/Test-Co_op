import React, { useState } from 'react';
import Header from '../components/header/Header-In'; // Import Header
import '../styles/styles_page/CheckInfoUser.css';
import UserInfo from '../components/checkIn_fo_user/UserInfo.js';
import CardShowNews from '../components/card_news/CardShow.js';
import NewsApprove from '../components/check_news_request/NewsToApprove.js'; // Ensure this is the correct file
import LogActionNews from '../components/check_news_request/LogActionNews.js'; // Import the LogActionNews component
import ApproveStatusNews from '../components/check_news_request/ApproveStatusNews.js';

const CheckNewsRequest = () => {
  const [currentTable, setCurrentTable] = useState('approved'); // State for current table

  return (
    <>
      <Header />
      <div className="app">
        <div className="leftpage-section">
          <h>Waiting For Approval</h>
          <ApproveStatusNews />
        </div>
        <div className="rightpage-section">
          <UserInfo isAlternative={false} theme="theme-green" />
          <h>News Card On Welcome</h>
          <div className="form-card">
            <CardShowNews />
            <div className="video-container">
              <iframe
                width="480"
                height="270"
                src="https://www.youtube.com/embed/AuVHftBiDVw"
                title="YouTube Video 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <iframe
                width="480"
                height="270"
                src="https://www.youtube.com/embed/SzMiJFOa6w8" // Use the corrected embed link
                title="YouTube Video 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <div className="rightfull-section">
        <h>All The News</h>
        <div className="form-card">
          <div className="table-switch">
            <h className='pages'>Pages :</h>
            <div>
              <button onClick={() => setCurrentTable('approved')}>All News Page</button>
              <button onClick={() => setCurrentTable('new')}>Check Approve Page</button>
              <button onClick={() => setCurrentTable('Log')}>Check Log Action News Page</button>
            </div>
          </div>
          <div className="form-fixcard">
            {currentTable === 'Log' ? (
              <LogActionNews /> // Render LogActionNews if currentTable is 'Log'
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
