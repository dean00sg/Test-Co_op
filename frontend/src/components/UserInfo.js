import React, { useEffect, useState } from 'react';

const UserInfo = ({ isAlternative }) => { // รับ isAlternative เป็น prop
    const [user, setUser] = useState(null);
    const [userImage, setUserImage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const profileResponse = await fetch('http://127.0.0.1:8000/profile/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setUser(data);
                } else {
                    const errorData = await profileResponse.json();
                    setError(errorData.detail || 'Failed to fetch user profile');
                }
            } catch (err) {
                setError('An error occurred while fetching the user profile');
            }
        };

        const fetchUserImage = async () => {
            try {
                const token = localStorage.getItem('token');
                const imageResponse = await fetch('http://127.0.0.1:8000/profile/image', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (imageResponse.ok) {
                    const imageBlob = await imageResponse.blob();
                    setUserImage(URL.createObjectURL(imageBlob));
                } else {
                    setError('Failed to fetch user image');
                }
            } catch (err) {
                setError('An error occurred while fetching the user image');
            }
        };

        fetchUserProfile(); 
        fetchUserImage();   
    }, []);

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (!user || !userImage) {
        return <p>Loading...</p>; 
    }

    return (
        <div className={`user-info ${isAlternative ? 'alternative' : ''}`}>
            <img src={userImage} alt="User Profile" className="user-image" />
            <div className="user-details">
                <p>Name: {user.first_name} {user.last_name}</p>
                <p>Role: {user.role}</p>
                <p>Email: {user.email}</p>
                <p>Phone: {user.contact_number}</p>
            </div>
        </div>
    );
};

export default UserInfo;
