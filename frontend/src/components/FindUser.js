import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faCheckSquare, faUserShield, faBell, faUsers, faUserCheck, faTools } from '@fortawesome/free-solid-svg-icons';
import '../styles/finduser.css';

const API_BASE_URL = 'http://127.0.0.1:8000';  

const FindUser = () => {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [error, setError] = useState('');

  // Function to fetch user profile data
  const fetchUserProfile = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Attach the token to the request
        },
      });
      if (!response.ok) {
        throw new Error('User not found or unauthorized');
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to fetch user profile image
  const fetchUserImage = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch(`${API_BASE_URL}/image_profile/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Attach the token to the request
        },
      });
      if (!response.ok) {
        throw new Error('Image not found or unauthorized');
      }
      const imageBlob = await response.blob();
      setUserImage(URL.createObjectURL(imageBlob)); // Create a URL for the image
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to handle the search by user ID
  const handleSearch = (e) => {
    e.preventDefault();
    if (userId) {
      fetchUserProfile(userId);
      fetchUserImage(userId);
    }
  };

  return (
    <div className="FindUser">
      <h1>Find User</h1>
      
      {/* Form for user ID input */}
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Enter User ID" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
        />
        <button type="submit">Search</button>
      </form>

      {/* Display error message */}
      {error && <p className="error">{error}</p>}

      {/* Display user profile and image if available */}
      {userData && (
        <div className="user-card">
          <div className="user-image">
            {userImage && <img src={userImage} alt="User Profile" />}
          </div>
          <div className="user-details">
            <h2>User Profile</h2>
            <p><strong>ID:</strong> {userData.user_id}</p>
            <p><strong>Name:</strong> {userData.first_name} {userData.last_name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
          </div>
          <div className="user-details">
            <p><strong>Contact:</strong> {userData.contact_number}</p>
            <p><strong>Role:</strong> {userData.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindUser;
