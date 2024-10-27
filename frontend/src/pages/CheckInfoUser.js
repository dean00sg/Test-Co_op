import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header-In'; // Import Header
import UserInfo from '../components/checkIn_fo_user/UserInfo';
import FindUser from '../components/checkIn_fo_user/FindUser';
import '../styles/styles_page/CheckInfoUser.css';

const CheckInfoUser = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [logs, setLogs] = useState([]); // State to hold logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assuming you have a way to get the token, like from local storage
  const token = localStorage.getItem('token'); // Change this to your token retrieval method

  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/profile/profile all', { // Ensure the endpoint is correct
          method: 'GET', // It's a good practice to specify the method
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Specify content type
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profiles');
        }

        const data = await response.json();
        setUserProfiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchLogs = async () => { // New function to fetch logs
      try {
        const response = await fetch('http://127.0.0.1:8000/profile/logs', { // Ensure the endpoint is correct
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }

        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserProfiles();
    fetchLogs(); // Call the new fetchLogs function
  }, [token]); // Added token as a dependency for useEffect

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Header /> 
      <div className="app">
        <div className="leftpage-section">
          <h>Log Action All</h> 
          <table className="lognews-table">
            <thead>
              <tr>
                <th>Log Id</th>
                <th>DateTime Action</th>
                <th>Action Name</th>
                <th>Role</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.slice(-15).map((log) => ( // ตัดให้แสดงแค่ 7 ตัวสุดท้าย
                  <tr key={log.user_id}>
                    <td>{log.id}</td>
                    <td>{log.action_datetime}</td>
                    <td>{log.action_name}</td>
                    <td>{log.role}</td>
                    <td>{log.user_id}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No logs available.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
        <div className="rightpage-section">
          <UserInfo isAlternative={false} theme="theme-green" />
          <h11>Check Info User</h11> 
          <div className="rightfull-section">
            <table className="user-profile-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {userProfiles.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.contact_number}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <FindUser/> 
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckInfoUser;
