import React, { useEffect, useState } from 'react';

import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarAlt,faTrash,faStickyNote,faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Header from '../header/Header-In';
import UserInfo from '../checkIn_fo_user/UserInfo';
import FormMeeting from '../calendar/form_meeting';
import Calendar from 'react-calendar';


const CreateMeeting = ({ currentTable }) => {
  
  return (
    <>
      <div className="app">
        <div className="leftpage-section">
          <Calendar/> {/* Use the renamed component here */}
        </div>
        <div className="rightpage-section">
          <UserInfo />
          <h>
            {/* <FontAwesomeIcon icon={faUsers} style={{ marginRight: '8px' }} /> */}
               Form Create Meeting
          </h>
          <FormMeeting />
        </div>
      </div>
    </>
  );
};

export default CreateMeeting;
