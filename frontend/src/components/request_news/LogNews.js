import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './statusnews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePen, faPenToSquare, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000';

const LogNews = () => {
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
    const [loading, setLoading] = useState(true);
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
            console.error(error);
            setError('Failed to submit news. Please try again.');
            setSuccessMessage(null);
        }
    };

    const fetchAllNews = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/log_news`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setNewsList(response.data);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch news.');
        } finally {
            setLoading(false);
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
            console.error(error);
            setError('Failed to fetch user profile.');
        }
    };

    const fetchImageForNews = async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/Log_tonews_image/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });
            const imageURL = URL.createObjectURL(response.data);
            setImages((prevImages) => ({ ...prevImages, [id]: imageURL }));
        } catch (error) {
            console.error(`Failed to fetch image for news_id: ${id}`, error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchAllNews();
    }, []);

    useEffect(() => {
        if (user && newsList.length > 0) {
            const userNews = newsList.filter((news) => news.user_id === user.user_id);
            const latestNews = userNews.slice(-15); // Get the latest 15 news
            setFilteredNews(latestNews);
            latestNews.forEach((news) => {
                fetchImageForNews(news.id); // Use `news.id` instead of `news.news_id`
            });
        }
    }, [user, newsList]);

    useEffect(() => {
        return () => {
            // Cleanup to revoke object URLs (if applicable)
            Object.values(images).forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="form-container">
            <div className="news-table">
                {filteredNews.length > 0 ? (
                    <table className="lognews-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>DateTime</th>
                                <th>Header</th>
                                <th>Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNews.map((news) => (
                                <tr key={news.id}> {/* Use `news.id` instead of `news.news_id` */}
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
                                    <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                        {news.action_datetime}
                                    </td>
                                    <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                        {news.action_name === 'update' ? news.to_header : news.header}
                                    </td>
                                    <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                        {images[news.id] ? (
                                            <img 
                                                src={images[news.id]} 
                                                alt={`Image for ${news.header}`} 
                                                style={{ width: '50px', height: 'auto' }} 
                                            />
                                        ) : (
                                            <p>No Image</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No news submitted yet.</p>
                )}
            </div>
        </div>
    );
};

export default LogNews;
