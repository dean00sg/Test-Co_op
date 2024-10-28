import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePen, faPenToSquare, faTrashAlt, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'; // Import PropTypes
import '../request_news/statusnews.css';

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

    const handleMouseDown = (e, columnKey) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columnWidths[columnKey] || 100; // Default width

        const handleMouseMove = (moveEvent) => {
            const newWidth = Math.max(50, startWidth + moveEvent.clientX - startX);
            setColumnWidths((prevWidths) => ({ ...prevWidths, [columnKey]: newWidth }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleSearch = () => {
        const { actionName, newsId, header } = searchTerm;
        const filtered = newsList.filter(news =>
            (actionName ? news.action_name.toLowerCase().includes(actionName.toLowerCase()) : true) &&
            (newsId ? news.news_id.toString().includes(newsId) : true) &&
            (header ? news.header.toLowerCase().includes(header.toLowerCase()) : true)
        );
        setFilteredNews(filtered);
    };

    const handleResetSearch = () => {
        setSearchTerm({ actionName: '', newsId: '', header: '' });
        setFilteredNews(newsList); // Show all news again
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
            
        </div>
    );
};



export default ApproveCard;
