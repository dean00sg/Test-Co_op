import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header-In';
import '../styles/styles_page/CheckInfoUser.css';
import UserInfo from '../components/checkIn_fo_user/UserInfo';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import AllBooking from '../components/booking_room.js/all_booking';


const API_BASE_URL = 'http://127.0.0.1:8000';

const CheckLogin = () => {
  
  return (
    <>
      <Header />
      <div className="app">
        <div className="leftpage-section">
          <h>Status News</h>
          
        </div>
        <div className="rightpage-section">
          <UserInfo  />
          <h>Form Request News</h>
          <AllBooking  />

          </div>
      </div>
    </>
  );
};

export default CheckLogin;
