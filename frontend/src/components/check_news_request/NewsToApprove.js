import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../request_news/statusnews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import NewsApproveBy from './CheckApproveBy';
import LogActionNews from './LogActionNews';

const API_BASE_URL = 'http://127.0.0.1:8000';

const NewsApprove = ({ currentTable }) => { // Accept currentTable as a prop
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

    const handleDelete = async (newsId) => {
        if (window.confirm('Are you sure you want to delete this news item?')) {
            try {
                await axios.delete(`${API_BASE_URL}/news/news/${newsId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setSuccessMessage('News deleted successfully!');
                fetchAllNews();
            } catch (error) {
                setError('Failed to delete news.');
            }
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
            const userNews = newsList;
            setFilteredNews(userNews);

            userNews.forEach((news) => {
                fetchImageForNews(news.news_id);
            });
        }
    }, [user, newsList]);

    return (
        <div className="form-container">
            <div className="news-table">
                {currentTable === 'approved' ? (
                    <table className='news-profile-table'>
                        <thead>
                            <tr>
                                <th>News ID</th>
                                <th>DeteTime Request</th>
                                <th>News Image</th>
                                <th>Header</th>
                                <th>Detail</th>
                                <th>Link</th>
                                <th>Status Show</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNews.map((news) => (
                                <tr key={news.news_id}>
                                    <td className='intable_box_table'>{news.news_id}</td>
                                    <td className='intable_box_table'>{news.datetime}</td>
                                    <td className='intable_box_table'>
                                        {images[news.news_id] ? (
                                            <img src={images[news.news_id]} alt={news.header} width="100" />
                                        ) : (
                                            'No image available'
                                        )}
                                    </td>
                                    <td className='intable_box_table'>{news.header}</td>
                                    <td className='intable_box_table'>{news.detail}</td>
                                    <td className='intable_box_table'>{news.link}</td>
                                    <td className='intable_box_table'>
                                        {news.status_approve === 'approve' ? (
                                            <FontAwesomeIcon icon={faCheckCircle} className="faCheckCircle" />
                                        ) : news.status_approve === 'request' ? (
                                            <FontAwesomeIcon icon={faHourglassHalf} className="faHourglassHalf" />
                                        ) : null}
                                        {news.status_approve}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="icon-actions">
                                            <FontAwesomeIcon 
                                                icon={faTrashAlt} 
                                                className="fa-icon delete" 
                                                onClick={() => handleDelete(news.news_id)} 
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : currentTable === 'Log' ? ( // Check for the Log condition
                    
                    <LogActionNews />
                ) : (
                    <div>
                        <h2>Check the approver for the News Request</h2>
                        <NewsApproveBy />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsApprove;