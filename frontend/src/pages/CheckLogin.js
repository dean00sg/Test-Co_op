import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header-In';
import '../styles/styles_page/CheckInfoUser.css';
import UserInfo from '../components/checkIn_fo_user/UserInfo';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const CheckLogin = () => {
  const [userData, setUserData] = useState(null);
  const [userEvents, setUserEvents] = useState([]); // Store list of user events
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const profileResponse = await fetch(`${API_BASE_URL}/profile/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const data = await profileResponse.json();
        setUserData(data);
        fetchUserEvents(data.user_id); // Fetch events using user_id
      } else {
        const errorData = await profileResponse.json();
        setError(errorData.detail || 'Failed to fetch user profile');
      }
    } catch (err) {
      setError('An error occurred while fetching the user profile');
    }
  };

  const fetchUserEvents = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Meeting/meetings/user/${userId}`);
      if (response.ok) {
        const events = await response.json(); // Assuming events is a list
        setUserEvents(events); // Store the list of events
        setLoading(false);
      } else {
        setError('Failed to fetch events');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while fetching events');
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterEventsByDate(date);
  };

  const filterEventsByDate = (date) => {
    const filteredEvents = userEvents.filter((event) => {
      const eventDate = new Date(event.start_datetime_meet); // Assuming start_datetime_meet is a valid date string
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    setEventsOnSelectedDate(filteredEvents);
  };

  // Function to render event markers on the calendar
  const tileContent = ({ date, view }) => {
    const eventDate = userEvents.filter((event) => {
      const eventDate = new Date(event.start_datetime_meet);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    
    return eventDate.length > 0 ? <span className="event-marker">•</span> : null; // Change to your preferred marker
  };

  return (
    <>
      <Header />
      <div className="app">
        <div className="leftpage-section">
          <h>Status News</h>
          
        </div>
        <div className="rightpage-section">
        


          {userData ? (
            <UserInfo isAlternative={false} theme="theme-green" userData={userData} />
          ) : (
            <p>Loading user info...</p>
          )}
          <h>Form Request News</h>


          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          <Calendar 
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent} // Custom tile content to show event markers
          />
          {eventsOnSelectedDate.length > 0 ? (
            <ul>
              {eventsOnSelectedDate.map((event, index) => (
                <li key={index}>
                  {event.header} - {new Date(event.start_datetime_meet).toLocaleString()} to {new Date(event.end_datetime_meet).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No events for this date.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckLogin;
