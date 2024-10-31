import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../request_news/styles/statusnews.css';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000';

const FormMeeting = () => {
    const [formData, setFormData] = useState({
      header: '',
      description: '', 
      room: '',
      start_datetime_meet: '', 
      end_datetime_meet: '', 
      to_user_id: [], // Store selected user IDs
      remark: '', 
      file_insert: null, 
    });
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const token = localStorage.getItem('token');
    const handleChange = (e) => {
      const { name, value, files } = e.target;
      setFormData({
        ...formData,
        [name]: files ? files[0] : value
      });
    };
    // Handle multi-select change
    const handleSelectChange = (selectedOptions) => {
      const selectedUserIds = selectedOptions.map(option => option.value);
      setFormData({
        ...formData,
        to_user_id: selectedUserIds,
      });
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('header', formData.header);
      form.append('description', formData.description); 
      form.append('room', formData.room);
      
      // Convert to 24-hour format before appending
      const formatTo24Hour = (dateTime) => {
        const date = new Date(dateTime);
        return date.toISOString().slice(0, 19); // Format to 'YYYY-MM-DDTHH:mm'
      };
      form.append('start_datetime_meet', formatTo24Hour(formData.start_datetime_meet)); 
      form.append('end_datetime_meet', formatTo24Hour(formData.end_datetime_meet)); 
      form.append('to_user_id', formData.to_user_id.join(',')); // Join user IDs as comma-separated string
      form.append('remark', formData.remark); 
      if (formData.file_insert) {
        form.append('file_insert', formData.file_insert);
      }
      try {
        await axios.post(`${API_BASE_URL}/Meeting/meetings/`, form, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccessMessage('Meeting submitted successfully!');
        setError(null);
        setFormData({
          header: '',
          description: '',
          room: '',
          start_datetime_meet: '',
          end_datetime_meet: '',
          to_user_id: [],
          remark: '',
          file_insert: null,
        });
      } catch (error) {
        setError(error.response?.data.detail || 'Failed to submit meeting. Please try again.');
        setSuccessMessage(null);
      }
    };
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/profile/profile all`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const userOptions = response.data.map(user => ({
            value: user.user_id, // Store user_id for backend submission
            label: `${user.first_name} ${user.last_name}` // Display name in dropdown
          }));
          setUsers(userOptions);
        } catch (error) {
          setError('Failed to fetch users.');
        }
      };
      fetchUsers();
    }, [token]);
  
    return (
      <div className="form-container">
        <div className="formnews-card">
          <form onSubmit={handleSubmit} className="news-form">
            <div className="form-row">
              <label>Header :</label>
              <input type="text" name="header" onChange={handleChange} value={formData.header} required />
            </div>
            <div className="formdetail-row">
              <label>Description :</label>
              <textarea
                name="description" 
                onChange={handleChange}
                value={formData.description} 
                placeholder="Enter details here..."
                required
              />
            </div>
            <div className="form-row">
              <label>Room :</label>
              <input type="text" name="room" onChange={handleChange} value={formData.room} required />
            </div>
            <div className="form-row">
              <label>Start Date/Time :</label>
              <input type="datetime-local" name="start_datetime_meet" onChange={handleChange} value={formData.start_datetime_meet} required />
            </div>
            <div className="form-row">
              <label>End Date/Time :</label>
              <input type="datetime-local" name="end_datetime_meet" onChange={handleChange} value={formData.end_datetime_meet} required />
            </div>
            
            <div style={{ display: 'flex',  flex: 1 ,width: '100%'}}>
            <label>Members:</label>
            <Select
                options={users}
                isMulti
                onChange={handleSelectChange}
                placeholder="Select members..."
                styles={{
                    control: (base) => ({
                        ...base,
                        width: '100%',
                        flexGrow: 1,
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        borderRight: '6px solid #28B78D',
                    }),
                    option: (provided) => ({
                        ...provided,
                        
                        alignItems: 'center',
                    }),
                }}
            />
        </div>

            <div className="form-row">
              <label>Remark :</label>
              <textarea
                name="remark"
                onChange={handleChange}
                value={formData.remark}
                placeholder="Enter remark here..."
              />
            </div>
            <div className="form-row">
              <label>File Upload:</label>
              <input type="file" name="file_insert" onChange={handleChange} />
            </div>
            <div className="button-group">
              <button type="submit">{isEditing ? 'Update' : 'Submit'}</button>
            </div>
          </form>
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  };
  
  export default FormMeeting;