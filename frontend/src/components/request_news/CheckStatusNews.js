import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../request_news/styles/statusnews.css';
import LogNews from './LogNews';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import { useNews } from './NewsContext';

const API_BASE_URL = 'http://127.0.0.1:8000';

const StatusNews = () => {
    const [filteredNews, setFilteredNews] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const token = localStorage.getItem('token');
    const { newsList, setNewsList } = useNews();

    const fetchAllNews = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/news`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setNewsList(response.data);
        } catch (error) {
            setError('Failed to fetch news.');
        }
    };

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

    const updateFilteredNews = async () => {
        // Fetch news again and update the filtered news
        await fetchAllNews();
        if (user) {
            const userNews = newsList.filter((news) => news.request_By === user.user_id);
            setFilteredNews(userNews);
        }
    };

    // Fetch user profile and news on mount
    useEffect(() => {
        fetchAllNews();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user && newsList.length > 0) {
            const userNews = newsList.filter((news) => news.request_By === user.user_id);
            setFilteredNews(userNews);
        }
    }, [user, newsList]);

    return (
        <div className="form-container">
            <div className="news-table">
                {filteredNews.length > 0 ? (
                    <table className='table_status_news'>
                        <thead>
                            <tr>
                                <th>Header</th>
                                <th>Status Show</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNews.map((news) => (
                                <tr key={news.news_id}>
                                    <td className='intable_box'>{news.header}</td>
                                    <td className='intable_box'>
                                        {news.status_approve === 'approve' ? (
                                            <FontAwesomeIcon icon={faCheckCircle} className="faCheckCircle" />
                                        ) : news.status_approve === 'request' ? (
                                            <FontAwesomeIcon icon={faHourglassHalf} className="faHourglassHalf" />
                                        ) : null} 
                                        {news.status_approve}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No news submitted yet</p>
                )}
            </div>
        </div>
    );
};

export default StatusNews;
