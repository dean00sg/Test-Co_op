import React, { useState } from 'react';
import Header from '../components/header/Header-In'; // Import Header
import '../styles/styles_page/CheckInfoUser.css';
import CreateMeeting from '../components/booking_room.js/firstpage_meeting'; // Ensure proper path
import AllBooking from '../components/booking_room.js/all_booking'; // Ensure proper path

const Meetingpage = () => {
  const [currentTable, setCurrentTable] = useState('formmeeting'); // Initialize state for currentTable

  return (
    <>
      <Header />
      <div className="app">
        <div className="fullpage">
          <div className="table-switch">
            <h2 className="pages">Pages:</h2> {/* Use h2 instead of h */}
            <div>
              <button onClick={() => setCurrentTable('formmeeting')}>Form Meeting</button>
              <button onClick={() => setCurrentTable('booking')}>All News Page</button>
            </div>
          </div>
          <div className="form-fixcard">
            {currentTable === 'formmeeting' ? ( // Render CreateMeeting when currentTable is 'formmeeting'
              <CreateMeeting />
            ) : currentTable === 'booking' ? ( // Render AllBooking when currentTable is 'booking'
              <AllBooking />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Meetingpage;
