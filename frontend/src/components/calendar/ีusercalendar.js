import React, { useState } from 'react';
import axios from 'axios';
import '../request_news/statusnews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000';

const UserCalendar = () => {
    const [formData, setFormData] = useState({
        header: '',
        description: '',
        start_datetime_meet: '',
        end_datetime_meet: ''
    });
    const [responseMessage, setResponseMessage] = useState('');
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/UserCalendar/meetings/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            setResponseMessage('Meeting created successfully!');
            setError('');
        } catch (err) {
            setError('Failed to create meeting.');
            setResponseMessage('');
        }
    };

    return (
        <div className="form-container">
            <div className="form-card">
                <h2>
                    <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: '8px' }} />
                    Note
                </h2>
                <form onSubmit={handleSubmit} className="news-form">
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
                    <div className="button-group">
                        <button type="submit">Submit</button>
                    </div>
                </form>
                {responseMessage && <p className="success-message">{responseMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default UserCalendar;
