import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarAlt,faTrash  } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000';

const CalendarComponent = () => {
  const [userData, setUserData] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);
  const [filesForEvents, setFilesForEvents] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [attendees, setAttendees] = useState({});
  const [showAttendees, setShowAttendees] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const profileResponse = await fetch(`${API_BASE_URL}/profile/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const data = await profileResponse.json();
        setUserData(data);
        fetchUserEvents(data.user_id);
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
        const events = await response.json();
        setUserEvents(events);
        setLoading(false);

        const userDetailsMap = {};
        for (const event of events) {
          const userDetail = await fetchUserById(event.create_byid);
          if (userDetail) {
            userDetailsMap[event.create_byid] = userDetail;
          }
          await fetchAttendeesForEvent(event.meet_id, event.to_user_id); // Fetch attendee details
        }
        setUserDetails(userDetailsMap);
        filterEventsByDate(selectedDate);
        await fetchFilesForEvents(events);
      } else {
        setError('Failed to fetch events');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while fetching events');
      setLoading(false);
    }
  };

  const fetchUserById = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch user by ID: ${userId}`, error);
      return null;
    }
  };

  const fetchAttendeesForEvent = async (meetId, toUserIds) => {
    try {
      const token = localStorage.getItem('token');
      const userIds = toUserIds.split(',');
      const attendeesList = await Promise.all(
        userIds.map(async (userId) => {
          const attendee = await fetchUserById(userId);
          return attendee ? { userId, ...attendee } : null;
        })
      );

      setAttendees((prevAttendees) => ({
        ...prevAttendees,
        [meetId]: attendeesList.filter((attendee) => attendee !== null),
      }));
    } catch (error) {
      console.error(`Failed to fetch attendees for meeting ${meetId}`, error);
    }
  };

  const fetchFilesForEvents = async (events) => {
    const token = localStorage.getItem('token');
    const filePromises = events.map(async (event) => {
      try {
        const fileResponse = await fetch(`${API_BASE_URL}/Meeting/meetings/file/${event.meet_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (fileResponse.ok) {
          const fileBlob = await fileResponse.blob();
          const fileURL = URL.createObjectURL(fileBlob);
          return { meet_id: event.meet_id, file_url: fileURL, file_name: `${event.header}.file` };
        } else {
          console.error(`Failed to fetch files for event ${event.meet_id}: ${fileResponse.status} ${fileResponse.statusText}`);
          return null;
        }
      } catch (err) {
        console.error(`An error occurred while fetching files for event ${event.meet_id}:`, err);
        return null;
      }
    });

    const files = await Promise.all(filePromises);
    const validFiles = files.filter(file => file !== null);
    const filesMap = validFiles.reduce((acc, file) => {
      acc[file.meet_id] = { file_url: file.file_url, file_name: file.file_name };
      return acc;
    }, {});

    setFilesForEvents(filesMap);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterEventsByDate(date);
  };
  const deleteEvent = async (meetId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/Meeting/meetings/${meetId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 204) {
        setUserEvents(userEvents.filter(event => event.meet_id !== meetId));
        filterEventsByDate(selectedDate);
      } else {
        setError('Failed to delete event');
      }
    } catch (error) {
      console.error(`Failed to delete event ${meetId}`, error);
      setError('An error occurred while deleting the event');
    }
  };

  const filterEventsByDate = (date) => {
    const filteredEvents = userEvents.filter((event) => {
      const eventDate = new Date(event.start_datetime_meet);
      return eventDate.toDateString() === date.toDateString();
    });
    setEventsOnSelectedDate(filteredEvents);
  };

  const tileContent = ({ date }) => {
    const dateString = date.toDateString();
    const eventsOnDate = userEvents.filter(event =>
      new Date(event.start_datetime_meet).toDateString() === dateString
    );
    return eventsOnDate.length > 0 ? <span className="event-marker">•</span> : null;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const toggleView = () => {
    setShowAttendees((prev) => !prev);
  };

  return (
    <div className="notification-panel">
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <Calendar 
        onChange={handleDateChange}
        value={selectedDate}
        tileContent={tileContent}
      />
      {eventsOnSelectedDate.length > 0 && (
        <div className='form-card'>
          <div className="card-header">
            <button onClick={toggleView} className="toggle-view-button">
              <FontAwesomeIcon icon={showAttendees ? faCalendarAlt : faUsers} />
              {showAttendees ? ' Show Events' : ' Show Attendees'}
            </button>
            {userData && userData.user_id === eventsOnSelectedDate[0].create_byid && (
              <button className="delete-button" onClick={() => deleteEvent(eventsOnSelectedDate[0].meet_id)}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            )}
          </div>
          <ul>
            {eventsOnSelectedDate.map((event) => (
              <li key={event.meet_id} className="event-item">
                {showAttendees ? (
                  <>
                    <h3>Attendees for Meeting</h3>
                    <div className="attendees-container">
                      {attendees[event.meet_id] ? (
                        attendees[event.meet_id].map((attendee) => (
                          <div key={attendee.userId} className="profiletable-container">
                            <img
                              src={`${API_BASE_URL}/profile/image/${attendee.userId}`}
                              alt={`${attendee.first_name} ${attendee.last_name}`}
                              className="profiletable-image"
                            />
                            <p>{`${attendee.first_name} ${attendee.last_name}`}</p>
                          </div>
                        ))
                      ) : (
                        <p>Loading attendees...</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="event-date">{formatDateTime(event.start_datetime_meet)}</p> 
                    <h3>{event.header}</h3>
                    <p><strong>Description:</strong> {event.description}</p>
                    <p><strong>Room:</strong> {event.room}</p>
                    <p><strong>Start:</strong> {formatDateTime(event.start_datetime_meet)}</p>
                    <p><strong>End:</strong> {formatDateTime(event.end_datetime_meet)}</p>
                    <p><strong>Remark:</strong> {event.remark}</p>
                    {filesForEvents[event.meet_id] && (
                      <div className="files-container">
                        <h4>Files:</h4>
                        <ul className="file-list">
                          <li className="file-item">
                            <a href={filesForEvents[event.meet_id].file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                              {filesForEvents[event.meet_id].file_name}
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                    {userDetails[event.create_byid] ? (
                      <div className="profiletable-container">
                        <strong>Created by:</strong>
                        <img
                          src={`${API_BASE_URL}/profile/image/${event.create_byid}`}
                          alt="User Profile"
                          className="profiletable-image"
                        />
                        {`${userDetails[event.create_byid]?.first_name || 'Loading...'} ${userDetails[event.create_byid]?.last_name || ''}`}
                      </div>
                    ) : (
                      <p>Loading creator details...</p>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
};

export default CalendarComponent;
