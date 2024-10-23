import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faCheckSquare, faUserShield, faBell, faUsers, faUserCheck, faTools } from '@fortawesome/free-solid-svg-icons';
import '../styles/menu_grid.css';

const MenuGrid = () => {
  const menuItems = [
    { label: 'Add Information', icon: faFolder },
    { label: 'Check Information', icon: faCheckSquare },
    { label: 'Add Admin', icon: faUserShield },
    { label: 'User Notification', icon: faBell },
    { label: 'Admin Notification', icon: faBell },
    { label: 'Root Team', icon: faUsers },
    { label: 'Check User', icon: faUserCheck },
    { label: 'IT Service', icon: faTools },
  ];

  return (
    <div className="menu-grid">
      {menuItems.map((item, index) => (
        <div key={index} className="menu-item">
          <FontAwesomeIcon icon={item.icon} size="2x" />
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default MenuGrid;
