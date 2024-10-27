import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faCheckSquare, faUserShield, faBell, faUsers, faUserCheck, faTools } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; 
import './menu_grid.css';

const MenuGrid = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Add News On Welcome', icon: faNewspaper, path: '/Home/AddNewsRequest' }, 
    { label: 'Approve News', icon: faCheckSquare, path: '/approve-news' },
    { label: 'User Management', icon: faUserShield, path: '/user-management' },
    { label: 'Notifications', icon: faBell, path: '/notifications' },
    { label: 'Team', icon: faUsers, path: '/team' },
    { label: 'User Check', icon: faUserCheck, path: '/user-check' },
    { label: 'Settings', icon: faTools, path: '/settings' },
  ];

  const handleMenuItemClick = (path) => {
    navigate(path); 
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
    </div>
  );
};

export default MenuGrid;
