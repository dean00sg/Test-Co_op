import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header-In'; // Import Header
import '../styles/styles_page/CheckInfoUser.css';
import RequestNews from '../components/request_news/RequestNews';
import UserInfo from '../components/checkIn_fo_user/UserInfo';
import StatusNews from '../components/request_news/CheckStatusNews';
import { NewsProvider } from '../components/request_news/NewsProvider';
import LogNews from '../components/request_news/LogNews';


const AddNewsRequest = () => {
  
  return (
    <>
      <Header /> 
      <NewsProvider>
        <div className="app">
          <div className="leftpage-section">
            <h>Status News</h> 
            <StatusNews />
            <LogNews/>
          
          </div>
          <div className="rightpage-section">
            
          <UserInfo isAlternative={false} theme="theme-green" />
          <h>Form Request News</h>
          <RequestNews/>
          </div>
        </div>
      </NewsProvider>
    </>
  );
};

export default AddNewsRequest;
