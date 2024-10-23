import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import '../styles/user_info.css';

const UserInfo = () => {
    return (
      <div className="user-info">
        <FontAwesomeIcon icon={faUser} size="3x" />
        <div className="user-details">
          <p>Name: Burhanurdin Sa-ong</p>
          <p>Position: Supervisor</p>
          <p>Email: Dean@gmail.com</p>
        </div>
      </div>
    );
  };
  
  export default UserInfo;
