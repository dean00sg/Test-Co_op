import React from 'react';
import Header from '../components/header/Header-In'; // นำเข้า Header
import MenuGrid from '../components/requasting_main/Requesting';
import Checking from '../components/requasting_main/Checking';
import UserInfo from '../components/checkIn_fo_user/UserInfo';
import '../styles/styles_page/HomePage.css';
import '../components/checkIn_fo_user/user_info.css';
import Calendar from '../components/calendar/calendar';


const HomePage = () => {
  return (
    <>
      <Header /> 
      <div className="app">
        <div className="leftHome-section">
          <h11>Requesting</h11>
          <MenuGrid />
          <div className="form-card">
            <h11>Checking Info</h11>
            <Checking />
        </div>
        </div>
        <div className="rightHome-section">
          <UserInfo isAlternative={false} /> {/* ตรวจสอบการส่ง isAlternative */}
          <Calendar/>
        </div>
      </div>
    </>
  );
};

export default HomePage;
