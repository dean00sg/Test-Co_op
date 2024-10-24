import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/menu_grid.css';
import CheckInfoUser from '../pages/CheckInfoUser'; // Import your target component

const Checking = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const menuItems = [
    { label: 'Check Profile User', icon: faUserCheck },
  ];

  const handleMenuItemClick = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="menu-grid">
      {menuItems.map((item, index) => (
        <div key={index} className="menu-item" onClick={() => handleMenuItemClick('/Home/CheckInfoUser')}>
          <FontAwesomeIcon icon={item.icon} size="2x" />
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Checking;
