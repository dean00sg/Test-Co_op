import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../request_news/statusnews.css';
import LogNews from './LogNews';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000';

const StatusNews = () => {
    const [formData, setFormData] = useState({
        header: '',
        detail: '',
        image_news: null,
        link: ''
      });
    const [newsList, setNewsList] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [images, setImages] = useState({});
    const token = localStorage.getItem('token');

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('header', formData.header);
        form.append('detail', formData.detail);
        form.append('image_news', formData.image_news);
        form.append('link', formData.link);

        try {
            await axios.post(`${API_BASE_URL}/news/news`, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccessMessage('News submitted successfully!');
            setError(null);
            setFormData({ header: '', detail: '', image_news: null, link: '' });
            fetchAllNews();
        } catch (error) {
            setError('Failed to submit news. Please try again.');
            setSuccessMessage(null);
        }
    };

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

    const fetchImageForNews = async (news_id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/news_image/${news_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });
            const imageURL = URL.createObjectURL(response.data);
            setImages((prevImages) => ({ ...prevImages, [news_id]: imageURL }));
        } catch (error) {
            console.error(`Failed to fetch image for news_id: ${news_id}`);
        }
    };

    useEffect(() => {
        fetchAllNews();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user && newsList.length > 0) {
            const userNews = newsList.filter((news) => news.request_By === user.user_id);
            setFilteredNews(userNews);

            userNews.forEach((news) => {
                fetchImageForNews(news.news_id);
            });
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
                                            <FontAwesomeIcon icon={faCheckCircle}  className="faCheckCircle" />
                                        ) : news.status_approve === 'request' ? (
                                            <FontAwesomeIcon icon={faHourglassHalf}  className="faHourglassHalf" />
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

            <div className="form-card">
                <h3>Your News updating</h3>
                <LogNews />
            </div>
        </div>
    );
};

export default StatusNews;
