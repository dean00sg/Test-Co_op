import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, getHours, getMinutes, isSameDay } from 'date-fns';
import './AllBooking.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const AllBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(1); // Default selected room

  const fetchBookings = async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/booking`, {
        params: { date: format(date, 'yyyy-MM-dd') },
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchBookings(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setBookings([]); // Clear previous bookings when the date changes
  };

  const handleRoomChange = (event) => {
    setSelectedRoom(parseInt(event.target.value, 10)); // Update selected room
  };

  const getGridPosition = (start, end) => {
    const startHour = getHours(new Date(start));
    const startMinute = getMinutes(new Date(start));
    const endHour = getHours(new Date(end));
    const endMinute = getMinutes(new Date(end));

    const startGrid = (startHour - 6) * 2 + Math.floor(startMinute / 30) + 1;
    const endGrid = (endHour - 6) * 2 + Math.ceil(endMinute / 30) + 1;

    return { start: startGrid, end: endGrid };
  };

  return (
    <div className="all-booking">
      <div className="flex-header">
        <h1 style={{ color: 'rgb(21, 131, 209)' }}>Booking Schedule</h1>
        <div className="flex-box">
          <div className="date-picker">
          <label htmlFor="room-select">Select Date : </label>
            <input
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
            />
          </div>

          <div className="room-selector">
            <label htmlFor="room-select">Select Room : </label>
            <select id="room-select" value={selectedRoom} onChange={handleRoomChange}>
              {[1, 2, 3, 4, 5].map((roomId) => (
                <option key={roomId} value={roomId}>Room {roomId}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Display the grid container regardless of selection */}
      <div className="grid-container">
        {/* Time Labels */}
        <div className="time-labels">
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className="time-label">
              {(i + 6).toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Room Rows */}
        <div className="room-row">
          <div className="room-label">Room {selectedRoom}</div>
          <div className="room-schedule">
            {selectedDate && bookings
              .filter((booking) => booking.room_id === selectedRoom && isSameDay(new Date(booking.start_datetime), selectedDate))
              .map((booking) => {
                const { start, end } = getGridPosition(booking.start_datetime, booking.end_datetime);
                return (
                  <div
                    key={booking.BRM_id}
                    className="booking"
                    style={{
                      gridColumnStart: start,
                      gridColumnEnd: end,
                    }}
                  >
                    <span>{booking.title_meeting}</span>
                    <span>{format(new Date(booking.start_datetime), 'HH:mm')} - {format(new Date(booking.end_datetime), 'HH:mm')}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllBooking;
