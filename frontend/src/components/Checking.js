import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faSignInAlt } from '@fortawesome/free-solid-svg-icons'; // Import the new icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/menu_grid.css';

const Checking = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const menuItems = [
    { label: 'Check Profile User', icon: faUserCheck, path: '/Home/CheckInfoUser' },
    { label: 'Check User Login-Logout', icon: faSignInAlt, path: '/Home/CheckLogin' }, // Use the new icon here
  ];

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
    </div>
  );
};

export default Checking;
