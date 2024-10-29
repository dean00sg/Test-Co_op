import React, { useEffect, useState } from 'react'; // Make sure to import useEffect and useState
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faCheckSquare, faUserShield, faBell, faUsers, faUserCheck, faTools } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; 
import './menu_grid.css';
import axios from 'axios';


const API_BASE_URL = 'http://127.0.0.1:8000';

const MenuGrid = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // State for user profile
  const [error, setError] = useState(null); // State for error handling
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(response.data);
    } catch (error) {
      setError('Failed to fetch user profile.');
    }
  };

  useEffect(() => {
    fetchUserProfile(); // Fetch user profile on component mount
  }, []);

  const menuItems = [
    { label: 'Add News On Welcome', icon: faNewspaper, path: '/Home/AddNewsRequest' }, 
    { label: 'Create Meeting', icon: faUsers, path: '/Home/CreateMeeting' },
    { label: 'User Management', icon: faUserShield, path: '/user-management' },
    { label: 'Notifications', icon: faBell, path: '/notifications' },
    { label: 'Team', icon: faUsers, path: '/team' },
    { label: 'User Check', icon: faUserCheck, path: '/user-check' },
    { label: 'Settings', icon: faTools, path: '/settings' },
  ];

  if (user && user.role === 'developer'&& 'admin') {
    // menuItems.push({ label: 'Create Meeting', icon: faUsers, path: '/Home/CreateMeeting' });
   
  }


  const handleMenuItemClick = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="menu-grid">
      {menuItems.map((item, index) => (
        <div 
          key={index} 
          className="menu-item" 
          onClick={() => handleMenuItemClick(item.path)}
        >
          <FontAwesomeIcon icon={item.icon} size="2x" />
          <p>{item.label}</p>
        </div>
      ))}
      {error && <p className="error-message">{error}</p>} {/* Display error message if any */}
    </div>
  );
};

export default MenuGrid;
