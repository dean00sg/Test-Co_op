import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePen, faPenToSquare, faTrashAlt, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'; // Import PropTypes
import '../request_news/styles/statusnews.css';
import CardShowNews from '../card_news/CardShow';
import ApproveStatusNews from './ApproveStatusNews';
import UserInfo from '../checkIn_fo_user/UserInfo';

const API_BASE_URL = 'http://127.0.0.1:8000';

const ApproveCard = () => {
    const [formData, setFormData] = useState({
        header: '',
        detail: '',
        image_news: null,
        link: ''
    });
    const [newsList, setNewsList] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [searchTerm, setSearchTerm] = useState({ actionName: '', newsId: '', header: '' }); // Search input state
    const [userDetails, setUserDetails] = useState({});
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    // State for column widths
    const [columnWidths, setColumnWidths] = useState({});

    const fetchAllNews = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/log_news`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNewsList(response.data);
            setFilteredNews(response.data); // Set filtered news to all news initially
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUserDetails(response.data);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch user profile.');
        }
    };

    const fetchImageForNews = async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/Log_tonews_image/{news_id}?log_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob',
            });
            const imageURL = URL.createObjectURL(response.data);
            setImages((prevImages) => ({ ...prevImages, [id]: imageURL }));
        } catch (error) {
            console.error(`Failed to fetch image for news_id: ${id}`, error);
        }
    };

    const fetchUserById = async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch user by ID: ${userId}`, error);
            return null;
        }
    };

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


    useEffect(() => {
        fetchUserProfile();
        fetchAllNews();
    }, []);

    useEffect(() => {
        if (newsList.length > 0) {
            setFilteredNews(newsList);
            newsList.forEach((news) => {
                fetchImageForNews(news.id);
                fetchUserById(news.user_id).then(userData => {
                    if (userData) {
                        setUserDetails(prevState => ({
                            ...prevState,
                            [news.user_id]: userData
                        }));
                    }
                });
            });
        }
    }, [newsList]);

    useEffect(() => {
        return () => {
            Object.values(images).forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="form-container">

            <div className='flex-row'>
                <div className="leftpage-section">
                    <h>Waiting For Approval</h>
                    <ApproveStatusNews />
                </div>
                <div className="rightpage-section">
                    <UserInfo isAlternative={false} theme="theme-green" />
                    <h>News Card On Welcome</h>
                    <div className="form-card">
                    <CardShowNews />
                    <div className="video-container">
                        <iframe
                        width="480"
                        height="270"
                        src="https://www.youtube.com/embed/AuVHftBiDVw"
                        title="YouTube Video 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ></iframe>

                        <iframe
                        width="480"
                        height="270"
                        src="https://www.youtube.com/embed/SzMiJFOa6w8"
                        title="YouTube Video 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ></iframe>
                    </div>
                    </div>
                </div>
            </div>

        </div>
    );
};



export default ApproveCard;
