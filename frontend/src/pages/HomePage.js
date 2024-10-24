import React from 'react';
import Header from '../components/Header-In'; // นำเข้า Header
import MenuGrid from '../components/Requesting';
import Checking from '../components/Checking';
import UserInfo from '../components/UserInfo';
import NotificationPanel from '../components/NotificationPanel';
import '../styles/styles_page/HomePage.css';
import '../styles/user_info.css';

const HomePage = () => {
  return (
    <>
      <Header /> 
      <div className="app">
        <div className="leftHome-section">
          <h11>Requesting</h11>
          <MenuGrid />
        </div>
        <div className="rightHome-section">
          <UserInfo isAlternative={false} /> {/* ตรวจสอบการส่ง isAlternative */}
          <NotificationPanel />
        </div>
      </div>
      <div className="leftHome-section">
        <h11>Checkinf Info</h11>
        <Checking />
      </div>
    </>
  );
};

export default HomePage;
