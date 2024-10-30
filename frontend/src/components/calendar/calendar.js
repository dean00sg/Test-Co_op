import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarAlt,faTrash,faStickyNote,faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import UserCalendar from './ีusercalendar';

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
  const [calendarEventsOnSelectedDate, setCalendarEventsOnSelectedDate] = useState([]);
  
  const [events, setEvents] = useState(calendarEventsOnSelectedDate);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    header: '',
    description: '',
    start_datetime_meet: '',
    end_datetime_meet: ''
  });

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
      const events = [];

      // Fetch meetings
      const meetingsResponse = await fetch(`${API_BASE_URL}/Meeting/meetings/user/${userId}`);
      if (meetingsResponse.ok) {
        const meetings = await meetingsResponse.json();
        const markedMeetings = meetings.map(event => ({ ...event, source: 'meetings' }));
        events.push(...markedMeetings);
      } else {
        setError('');
      }

      // Fetch user calendar events, if it exists
      const calendarResponse = await fetch(`${API_BASE_URL}/UserCalendar/user/${userId}`);
      if (calendarResponse.ok) {
        const calendarEvents = await calendarResponse.json();
        const markedCalendarEvents = calendarEvents.map(event => ({ ...event, source: 'calendar' }));
        events.push(...markedCalendarEvents);
      } else {
        console.error('Failed to fetch calendar events, but continuing with meetings only.');
      }

      setUserEvents(events);
      setLoading(false);

      // Fetch user details and attendees for meetings only
      const userDetailsMap = {};
      for (const event of events.filter(event => event.source === 'meetings')) {
        const userDetail = await fetchUserById(event.create_byid);
        if (userDetail) {
          userDetailsMap[event.create_byid] = userDetail;
        }
        await fetchAttendeesForEvent(event.meet_id, event.to_user_id);
      }

      setUserDetails(userDetailsMap);
      filterEventsByDate(selectedDate);
      await fetchFilesForEvents(events.filter(event => event.source === 'meetings'));
    } catch (err) {
      setError('');
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

  
  const deleteUserNoteEvent = async (celendarId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/UserCalendar/meetings/${celendarId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Event deleted successfully!');
        // Update the state by filtering out the deleted event
        setEvents((prevEvents) => prevEvents.filter(event => event.celendar_id !== celendarId));
        // Close the edit view if it was open
        setIsEditing(false);
      } else {
        alert('Failed to delete event.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('An error occurred while deleting the event.');
    }
  };
  
  
  

  const filterEventsByDate = (date) => {
    const meetingsEvents = userEvents.filter((event) => {
      const eventDate = new Date(event.start_datetime_meet);
      return event.source === 'meetings' && eventDate.toDateString() === date.toDateString();
    });
    const calendarEvents = userEvents.filter((event) => {
      const eventDate = new Date(event.start_datetime_meet);
      return event.source === 'calendar' && eventDate.toDateString() === date.toDateString();
    });
    setEventsOnSelectedDate(meetingsEvents);
    setCalendarEventsOnSelectedDate(calendarEvents);
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



  const handleUpdate = async (celendarId) => {
    try {
        const token = localStorage.getItem('token');
        const formDataObj = new FormData();
        Object.keys(formData).forEach(key => {
            formDataObj.append(key, formData[key]);
        });

        // ส่งข้อมูลการอัปเดตไปยัง API
        const response = await axios.put(`${API_BASE_URL}/UserCalendar/meetings/${celendarId}`, formDataObj, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data', // สำหรับ FormData
            },
        });

        // อัปเดตสถานะด้วยข้อมูลใหม่ที่ได้จากการตอบกลับ
        setCalendarEventsOnSelectedDate(prevEvents =>
            prevEvents.map(event => 
                event.celendar_id === celendarId ? response.data : event
            )
        );

        setIsEditing(false); // ออกจากโหมดการแก้ไข
    } catch (error) {
        console.error('Error updating event:', error);
        setError('Failed to update the event.'); // แสดงข้อความผิดพลาดถ้าเกิดข้อผิดพลาด
    }
};

  

  const handleEditClick = (event) => {
    setFormData({
      header: event.header,
      description: event.description,
      start_datetime_meet: event.start_datetime_meet,
      end_datetime_meet: event.end_datetime_meet,
    });
    setIsEditing(true);
  };
  // Function to handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };


  // Function to handle Cancel button in the form
  const handleCancelEdit = () => {
    setIsEditing(false);
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
      {eventsOnSelectedDate.length > 0 ? (
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
                    <p><strong>Description :</strong> {event.description}</p>
                    <p><strong>Room :</strong> {event.room}</p>
                    <p><strong>Start :</strong> {formatDateTime(event.start_datetime_meet)}</p>
                    <p><strong>End :</strong> {formatDateTime(event.end_datetime_meet)}</p>
                    <p><strong>Remark :</strong> {event.remark}</p>
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
      ) : (
        // Only render UserCalendar if there are no eventsOnSelectedDate
        calendarEventsOnSelectedDate.length === 0 && <UserCalendar />
      )}
        {calendarEventsOnSelectedDate.map((event) => (
          <div key={event.celendar_id} className="form-card" style={{ backgroundColor: 'rgb(107, 165, 206)', color: 'white' }}>
            <div className="card-header">
              <h2 style={{ display: 'flex', alignItems: 'center', marginRight: '8px', color: 'white' }}>
                <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: '8px' }} />
                User Note
              </h2>
              {!isEditing && (
                <>
                  <button onClick={() => handleEditClick(event)} className="update-button">
                    <FontAwesomeIcon icon={faPenToSquare} /> Update
                  </button>
                  <button className="delete-button" onClick={() => deleteUserNoteEvent(event.celendar_id)}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </>
              )}
            </div>

            {!isEditing ? (
              <ul>
                <li className="event-item">
                  <p className="event-date" style={{ backgroundColor: 'white', color: '#006edc' }}>
                    {formatDateTime(event.start_datetime_meet)}
                  </p>
                  <h3>{event.header}</h3>
                  <p><strong>Description :</strong> {event.description}</p>
                  <p><strong>Start :</strong> {formatDateTime(event.start_datetime_meet)}</p>
                  <p><strong>End :</strong> {formatDateTime(event.end_datetime_meet)}</p>
                </li>
              </ul>
            ) : (
              <div className="form-card" style={{ color: '#006edc' }}>
                <h2>
                  <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: '8px' }} />
                  Edit Note
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(event.celendar_id); }} className="news-form">
                  <div className="form-row">
                    <label>Header:</label>
                    <input
                      type="text"
                      name="header"
                      onChange={handleChange}
                      value={formData.header}
                      required
                    />
                  </div>
                  <div className="formdetail-row">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      onChange={handleChange}
                      value={formData.description}
                      placeholder="Enter details here..."
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Start Date/Time:</label>
                    <input
                      type="datetime-local"
                      name="start_datetime_meet"
                      onChange={handleChange}
                      value={formData.start_datetime_meet}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>End Date/Time:</label>
                    <input
                      type="datetime-local"
                      name="end_datetime_meet"
                      onChange={handleChange}
                      value={formData.end_datetime_meet}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="update-button">Update</button>
                    <button type="button" className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </form>
                {error && <p className="error-message">{error}</p>}
              </div>
            )}
          </div>
        ))}

      </div>
  );
  
  
};

export default CalendarComponent;