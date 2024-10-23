import React from 'react';
import '../styles/notification_panel.css';

const NotificationPanel = () => {
  const notifications = [
    "Please be informed that a scheduled server maintenance will take place...",
    "Another scheduled server maintenance will take place on July 29th."
  ];

  return (
    <div className="notification-panel">
      {notifications.map((notification, index) => (
        <div key={index} className="notification-item">
          <img src="./assets/icons/bell.png" alt="Notification" />
          <p>{notification}</p>
        </div>
      ))}
      <div className="ad-panel">
        <img src="./assets/icons/food_ad.png" alt="Ad" />
      </div>
    </div>
  );
};

export default NotificationPanel;
