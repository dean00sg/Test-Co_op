import React from 'react';
import Header from '../components/header/Header-Out'; // นำเข้า Header

import UserInfo from '../components/checkIn_fo_user/UserInfo';
import LoginPanel from '../components/login/login';
import CardShowNews from '../components/card_news/CardShow';
import logo from '../assets/logo.png'; // อ้างถึงรูปภาพจากโฟลเดอร์ assets
import '../styles/styles_page/WelcomePage.css';

const WelcomePage = () => {
  return (
    <>
      <Header />
      <div className="app">
        <div className="leftWelcome-section">
          <div> 
            {/* className="image-text-container" */}
          
            {/* <img src={logo} alt="Logo" className="logo-image" />
            <div className="text-container">
              <h>Testing System by Burhanurdin (Dean)</h>
              <ha>Designed by Burhanurdin (Dean), this system is a testing platform for experimenting with front-end and back-end code. It helps study various programming languages, enhancing coding skills and self-development across multiple technologies.</ha>
            </div> */}

          </div>
          <CardShowNews />
          <div className="video-container" >
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
        <div className="rightWelcome-section">
          <LoginPanel />
          
        </div>
      </div>
    </>
  );
};

export default WelcomePage;
