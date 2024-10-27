import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faSignInAlt, faFileCircleCheck } from '@fortawesome/free-solid-svg-icons'; // Import the new icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios for API calls
import './menu_grid.css';


const API_BASE_URL = 'http://127.0.0.1:8000';
const Checking = () => {
  const navigate = useNavigate(); // Initialize useNavigate
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
    
    { label: 'Check User Login-Logout', icon: faSignInAlt, path: '/Home/CheckLogin' },
  ];

  // Add the "Check News Request" menu item only if the user role is developer
  if (user && user.role === 'developer') {
    menuItems.push({ label: 'Check News Request', icon: faFileCircleCheck, path: '/Home/CheckNewsRequest' });
    menuItems.push({ label: 'Check Profile User', icon: faUserCheck, path: '/Home/CheckInfoUser' });
  }




  
  const handleMenuItemClick = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="menu-grid">
      {menuItems.map((item, index) => (
        <div key={index} className="menu-item" onClick={() => handleMenuItemClick(item.path)}>
          <FontAwesomeIcon icon={item.icon} size="2x" />
          <p>{item.label}</p>
        </div>
      ))}
      {error && <p className="error">{error}</p>} {/* Display error if fetching fails */}
    </div>
  );
};

export default Checking;
