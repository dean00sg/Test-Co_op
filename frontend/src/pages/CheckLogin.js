import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header-In'; // Import Header
import '../styles/styles_page/CheckInfoUser.css';
import UserInfo from '../components/checkIn_fo_user/UserInfo';

const CheckLogin = () => {
  
  return (
    <>
      <Header /> 
      <div className="app">
        <div className="leftpage-section">
              <h>Status News</h>
          </div>
          <div className="rightpage-section">
              <UserInfo isAlternative={false} theme="theme-green" />
              <h>Form Request News</h>


          </div>
        
      </div>
    </>
  );
};

export default CheckLogin;
