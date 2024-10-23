import React from 'react';
import Header from '../components/Header-In'; // นำเข้า Header
import MenuGrid from '../components/MenuGrid';
import UserInfo from '../components/UserInfo';
import NotificationPanel from '../components/NotificationPanel';
import '../styles/styles_page/HomePage.css';

const HomePage = () => {
  return (
    <>
      <Header /> 
      <div className="app">
        {/* <div className="left-section">
            <TapBarPanel />
        </div> */}
        <div className="leftHome-section">
          <h11>Requesting</h11>
          <MenuGrid />
        </div>
        <div className="rightHome-section">
          <UserInfo />
          <NotificationPanel />
        </div>
      </div>
    </>
  );
};

export default HomePage;
