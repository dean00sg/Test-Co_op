import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header-In'; // Import Header
import '../styles/styles_page/CheckInfoUser.css';
import RequestNews from '../components/request_news/RequestNews';
import UserInfo from '../components/checkIn_fo_user/UserInfo';
import StatusNews from '../components/request_news/CheckStatusNews';

const AddNewsRequest = () => {
  
  return (
    <>
      <Header /> 
      <div className="app">
        <div className="leftpage-section">
          <h>Status News</h> 
          <StatusNews /> 
         
        </div>
        <div className="rightpage-section">
          
        <UserInfo isAlternative={false} theme="theme-green" />
        <h>Form Request News</h>
        <RequestNews/>
        </div>
      </div>
    </>
  );
};

export default AddNewsRequest;
