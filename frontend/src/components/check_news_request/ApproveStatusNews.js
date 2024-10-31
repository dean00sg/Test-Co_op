import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../request_news/styles/statusnews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf, faCheckToSlot, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000';

const ApproveStatusNews = () => {
    const [newsList, setNewsList] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [images, setImages] = useState({});
    const [selectedNewsId, setSelectedNewsId] = useState(null);
    const [randomNews, setRandomNews] = useState(null); // State for random news
    const token = localStorage.getItem('token');

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

    const approveNews = async (news_id) => {
        try {
            await axios.put(`${API_BASE_URL}/news/${news_id}?status_approve=approve`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Refresh the news list after approval
            fetchAllNews();
            setSuccessMessage(`News ${news_id} approved successfully.`);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error approving news:', error);
            setError('Failed to approve news: ' + (error.response?.data?.detail || 'Unknown error'));
        }
    };

    useEffect(() => {
        fetchAllNews();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user && newsList.length > 0) {
            const userNews = newsList.filter((news) => news.status_approve === "request");
            setFilteredNews(userNews);

            userNews.forEach((news) => {
                fetchImageForNews(news.news_id);
            });

            // Select a random news to display when the page loads
            const randomIndex = Math.floor(Math.random() * userNews.length);
            if (userNews[randomIndex]) {
                setRandomNews(userNews[randomIndex]);
            }
        }
    }, [user, newsList]);

    const handleSelectNews = (news_id) => {
        setSelectedNewsId(news_id);
        const selectedNews = filteredNews.find(news => news.news_id === news_id);
        setRandomNews(selectedNews); // Update the random news to the selected one
    };

    const handleCancel = () => {
        setSelectedNewsId(null);
    };

    return (
        <div className="form-container">
            <div className="news-table">
                {filteredNews.length > 0 ? (
                    <table className='table_status_news'>
                        <thead>
                            <tr>
                                <th>News ID</th>
                                <th>Header</th>
                                <th>Status Show</th>
                                <th>Approve</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNews.map((news) => (
                                <tr key={news.news_id}>
                                    <td className='intable_box'>{news.news_id}</td>
                                    <td className='intable_box'>{news.header}</td>
                                    <td className='intable_box'>
                                        {news.status_approve === 'approve' ? (
                                            <FontAwesomeIcon icon={faCheckCircle} className="faCheckCircle" />
                                        ) : news.status_approve === 'request' ? (
                                            <FontAwesomeIcon icon={faHourglassHalf} className="faHourglassHalf" />
                                        ) : null}
                                        {news.status_approve}
                                    </td>
                                    <td className='intable_box centered-intable-box'>
                                        <div onClick={() => handleSelectNews(news.news_id)}>
                                            <FontAwesomeIcon icon={faCheckToSlot} className='faCheckToSlot' />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No news submitted yet.</p>
                )}
            </div>

            {randomNews && ( // Show selected news card
                <div className="form-card">
                    <h2>Card To Approve</h2>
                    <div className="card-approve" key={randomNews.news_id}>
                    <p className="card-p"><strong>News ID:</strong> {randomNews.news_id}</p>
                        <div className="card-image">
                            <img src={images[randomNews.news_id]} alt={randomNews.header} />
                        </div>
                        <div className="card-content">
                            <h3>{randomNews.header}</h3>
                            <p>{randomNews.detail}</p>
                            <button className="open-link-btn" onClick={() => window.open(randomNews.link, '_blank')}>
                                <FontAwesomeIcon icon={faExternalLinkAlt} /> Open Link
                            </button>
                            <div className="button-container">
                                <button className="approve-btn" onClick={() => approveNews(randomNews.news_id)}>
                                    Approve
                                </button>
                                <button className="cancel-btn" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                            {successMessage && <div className="success-message">{successMessage}</div>}
                            {error && <div className="error-message">{error}</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproveStatusNews;
