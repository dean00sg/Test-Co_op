import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header-In';
import '../styles/styles_page/CheckInfoUser.css';
import UserInfo from '../components/checkIn_fo_user/UserInfo';
import CalendarComponent from 'react-calendar'; // Rename import
import 'react-calendar/dist/Calendar.css';
import Calendar from '../components/calendar/calendar';
import FormMeeting from '../components/calendar/form_meeting';

const API_BASE_URL = 'http://127.0.0.1:8000';

const CreateMeeting = () => {
  
  return (
    <>
      <Header />
      <div className="app">
        <div className="leftpage-section">
          <Calendar/> {/* Use the renamed component here */}
        </div>
        <div className="rightpage-section">
          <UserInfo />
          <h>Form Create Meeting</h>
          <FormMeeting />
        </div>
      </div>
    </>
  );
};

export default CreateMeeting;
