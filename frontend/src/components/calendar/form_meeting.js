import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const API_BASE_URL = 'http://127.0.0.1:8000';

const FormMeeting = () => {
  const [formData, setFormData] = useState({
    header: '',
    description: '', 
    room: '',
    start_datetime_meet: '', 
    end_datetime_meet: '', 
    to_user_id: [], // Changed to array for multiple selection
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
    form.append('start_datetime_meet', formData.start_datetime_meet); 
    form.append('end_datetime_meet', formData.end_datetime_meet); 
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
          value: user.user_id,
          label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={`${API_BASE_URL}/profile/image/${user.user_id}`}
                alt="User Profile"
                style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 8,objectFit: 'cover' }}
              />
              {`${user.first_name} ${user.last_name}`}
            </div>
          )
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
          <div className="form-row">
            <label>Members :</label>
            <div style={{ flex: 1 , display: 'flex' }}>
                <Select
                    options={users}
                    isMulti
                    onChange={handleSelectChange}
                    placeholder="Select members..."
                    styles={{
                    control: (base) => ({
                        ...base,
                        width: '100%', 
                        minWidth: '800px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        borderRight: '6px solid #28B78D',
                    }),
                    option: (provided) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center',
                    }),
                    }}
                />
                </div>


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
