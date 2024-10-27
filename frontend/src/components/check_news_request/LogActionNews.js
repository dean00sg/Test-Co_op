import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePen, faPenToSquare, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../request_news/statusnews.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const LogActionNews = () => {
    const [newsList, setNewsList] = useState([]);
    const [images, setImages] = useState({});
    const [users, setUsers] = useState({});
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    const fetchAllNews = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/log_news`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setNewsList(response.data);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            setError('Failed to fetch news, please try again later.');
        }
    };

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUsers((prevUsers) => ({ ...prevUsers, [userId]: response.data }));
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setError('Failed to fetch user profile.');
        }
    };

    const fetchImageForNews = async (newsId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/Log_tonews_image/${newsId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });
            const imageURL = URL.createObjectURL(response.data);
            setImages((prevImages) => ({ ...prevImages, [newsId]: imageURL }));
        } catch (error) {
            console.error(`Failed to fetch image for news_id: ${newsId}`, error);
        }
    };

    useEffect(() => {
        fetchAllNews();
    }, []);

    useEffect(() => {
        if (newsList.length > 0) {
            newsList.forEach((news) => {
                fetchImageForNews(news.news_id);  // Updated to use news.news_id
                fetchUserProfile(news.user_id);
            });
        }
        return () => {
            Object.values(images).forEach(image => URL.revokeObjectURL(image));
        };
    }, [newsList]);

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="form-container">
            {error && <p className="error-message">{error}</p>}
            <div className="news-table">
                <table className='news-profile-table'>
                    <thead>
                        <tr>
                            <th>News ID</th>
                            <th>Action Name</th>
                            <th>Action DateTime</th>
                            <th>Action By</th>
                            <th>Action Role</th>
                            <th>Image</th>
                            <th>To Image</th>
                            <th>Header</th>
                            <th>To Header</th>
                            <th>Detail</th>
                            <th>To Detail</th>
                            <th>Link</th>
                            <th>To Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newsList.map((news) => (
                            <tr key={news.news_id}>
                                <td className='intable_box_table'>{news.news_id}</td>
                                <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                    {news.action_name === 'update' ? (
                                        <FontAwesomeIcon icon={faPenToSquare} className="faPenToSquare" />
                                    ) : news.action_name === 'create' ? (
                                        <FontAwesomeIcon icon={faFilePen} className="faFilePen" />
                                    ) : news.action_name === 'delete' ? (
                                        <FontAwesomeIcon icon={faTrashAlt} className="faTrash" />
                                    ) : null}
                                    {news.action_name}
                                </td>
                                <td className='intable_box_table'>{formatDateTime(news.action_datetime)}</td>
                                <td className='intable_box_table'>
                                    {users[news.user_id] && users[news.user_id].first_name ? (
                                        <div className="profiletable-container">
                                            <img
                                                src={`${API_BASE_URL}/profile/image/${news.user_id}`}
                                                alt="User Profile"
                                                className="profiletable-image"
                                            />
                                            {`${users[news.user_id].first_name} ${users[news.user_id].last_name}`}
                                        </div>
                                    ) : 'Loading...'}
                                </td>
                                <td className='intable_box_table'>{users[news.user_id] ? users[news.user_id].role : 'Loading...'}</td>
                                <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                    {images[news.news_id] ? (
                                        <img 
                                            src={images[news.news_id]} 
                                            alt={`Image for ${news.header}`} 
                                            style={{ width: '50px', height: 'auto' }} 
                                        />
                                    ) : (
                                        <p>No Image</p>
                                    )}
                                </td>
                                <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                    {images[news.news_id] ? (
                                        <img 
                                            src={images[news.news_id]} 
                                            alt={`Image for ${news.to_header}`} 
                                            style={{ width: '50px', height: 'auto' }} 
                                        />
                                    ) : (
                                        <p>No Image</p>
                                    )}
                                </td>
                                <td className='intable_box_table'>{news.header}</td>
                                <td className='intable_box_table'>{news.to_header}</td>
                                <td className='intable_box_table'>{news.detail}</td>
                                <td className='intable_box_table'>{news.to_detail}</td>
                                <td className='intable_box_table'>{news.link}</td>
                                <td className='intable_box_table'>{news.to_link}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogActionNews;
