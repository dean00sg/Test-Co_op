import React, { useEffect, useState } from 'react';
import Header from '../components/Header-In'; // Import Header
import '../styles/styles_page/CheckInfoUser.css';
import RequestNews from '../components/RequestNews';
import UserInfo from '../components/UserInfo';

const AddNewsRequest = () => {
  
  return (
    <>
      <Header /> 
      <div className="app">
      <div className="leftpage-section">
          <h>Log Action All</h> 
         
        </div>
        <div className="rightpage-section">
          
        <UserInfo isAlternative={true} />
        <h>Form Request News</h>
        <RequestNews/>
        </div>
      </div>
    </>
  );
};

export default AddNewsRequest;
