import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePen, faPenToSquare, faTrashAlt, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'; // Import PropTypes
import '../request_news/statusnews.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const LogActionNews = () => {
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
            <div className="flex-header">
                <h2>Check Actioner Of Data</h2>
                <h className='advice-red'>
                    <FontAwesomeIcon icon={faTriangleExclamation} /> 
                    You can adjust the table width by dragging the resize handle at the top of the table header.
                </h>
                {/* Search Inputs */}
                <div className="searchtable-container">
                    <select
                        value={searchTerm.actionName}
                        onChange={(e) => setSearchTerm({ ...searchTerm, actionName: e.target.value })}
                    >
                        <option value="" disabled>Select Action Name</option>
                        <option value="create">create</option>
                        <option value="update">update</option>
                        <option value="delete">delete</option>
                        {/* Add more options as needed */}
                    </select>
                    
                    <input
                        type="text"
                        placeholder="Search by News ID"
                        value={searchTerm.newsId}
                        onChange={(e) => setSearchTerm({ ...searchTerm, newsId: e.target.value })}
                    />
                    
                    <input
                        type="text"
                        placeholder="Search by Header"
                        value={searchTerm.header}
                        onChange={(e) => setSearchTerm({ ...searchTerm, header: e.target.value })}
                    />
                    <button className='Search' onClick={handleSearch}>Search</button>
                    <button className='resetSearch' onClick={handleResetSearch}>Reset Search</button> {/* Reset Search Button */}
                </div>
            </div>

            <div className="news-table">
                {filteredNews.length > 0 ? (
                    <table className="lognews-table">
                        <thead>
                            <tr>
                                <th style={{ width: columnWidths.news_id }}>News ID</th>
                                <th onMouseDown={(e) => handleMouseDown(e, 'action_name')}>
                                    Action Name
                                </th>
                                <th style={{ width: columnWidths.action_datetime  }} onMouseDown={(e) => handleMouseDown(e, 'action_datetime')}>
                                    Action DateTime
                                </th>
                                <th style={{ width: columnWidths.action_by  }} onMouseDown={(e) => handleMouseDown(e, 'action_by')}>
                                    Action By
                                </th>
                                <th style={{ width: columnWidths.action_role }} onMouseDown={(e) => handleMouseDown(e, 'action_role')}>
                                    Action Role
                                </th>
                                <th style={{ width: columnWidths.image  }}>Image</th>
                                <th style={{ width: columnWidths.to_image  }}>To Image</th>
                                <th style={{ width: columnWidths.header }} onMouseDown={(e) => handleMouseDown(e, 'header')}>Header</th>
                                <th style={{ width: columnWidths.to_header  }} onMouseDown={(e) => handleMouseDown(e, 'to_header')}>To Header</th>
                                <th style={{ width: columnWidths.detail  }} onMouseDown={(e) => handleMouseDown(e, 'detail')}>Detail</th>
                                <th style={{ width: columnWidths.to_detail }} onMouseDown={(e) => handleMouseDown(e, 'to_detail')}>To Detail</th>
                                <th style={{ width: columnWidths.link }} onMouseDown={(e) => handleMouseDown(e, 'link')}>Link</th>
                                <th style={{ width: columnWidths.to_link  }} onMouseDown={(e) => handleMouseDown(e, 'to_link')}>To Link</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {filteredNews.map(news => (
                                <tr key={news.id}>
                                    <td >{news.news_id}</td>
                                    <td className={`intable_box 
                                        ${news.action_name === 'delete' ? 'deleted' : ''} `}>
                                        {news.action_name === 'update' && (
                                            <>
                                                <FontAwesomeIcon icon={faPenToSquare} className="faPenToSquare" />
                                                {news.action_name}
                                            </>
                                        )}
                                        {news.action_name === 'create' && (
                                            <>
                                                <FontAwesomeIcon icon={faFilePen} className="faFilePen" />
                                                {news.action_name}
                                            </>
                                        )}
                                        {news.action_name === 'delete' && (
                                            <>
                                                <FontAwesomeIcon icon={faTrashAlt} className="faTrash" />
                                                {news.action_name}
                                            </>
                                        )}
                                    </td>

                                    <td  style={{ width: columnWidths.action_datetime  }} onMouseDown={(e) => handleMouseDown(e, 'action_datetime')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`} >{formatDateTime(news.action_datetime)}</td>
                                    <td style={{ width: columnWidths.action_by  }} onMouseDown={(e) => handleMouseDown(e, 'action_by')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`} >
                                        {userDetails[news.user_id] ? (
                                            <div className="profiletable-container">
                                                <img
                                                    src={`${API_BASE_URL}/profile/image/${news.user_id}`}
                                                    alt="User Profile"
                                                    className="profiletable-image"
                                                />
                                                {`${userDetails[news.user_id].first_name} ${userDetails[news.user_id].last_name}`}
                                            </div>
                                        ) : (
                                            <p>Loading user details...</p> 
                                        )}
                                    </td>
                                    <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>{userDetails[news.user_id]?.role || 'Loading...'}</td>


                                    <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                        {news.action_name !== 'create' && (
                                            <img
                                            src={`${API_BASE_URL}/news/Log_news_image/{news_id}?log_id=${news.id}`}  // Replace {news_id} with the actual value if needed
                                            alt="News Image"
                                            style={{ width: '100%', height: 'auto' }}  
                                            />
                                        )}
                                    </td>

                                    <td className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>
                                        {images[news.id] ? <img src={images[news.id]} alt={`News ${news.id}`} style={{ width: '100%' }} /> : 'No Image'}
                                    </td>

                                    
                                    
                                    
                                    <td style={{ width: columnWidths.header }} onMouseDown={(e) => handleMouseDown(e, 'header')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>{news.header}</td>
                                    <td style={{ width: columnWidths.to_header }} onMouseDown={(e) => handleMouseDown(e, 'to_header')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>{news.to_header}</td>
                                    <td style={{ width: columnWidths.detail }} onMouseDown={(e) => handleMouseDown(e, 'detail')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>{news.detail}</td>
                                    <td style={{ width: columnWidths.to_detail }} onMouseDown={(e) => handleMouseDown(e, 'to_detail')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>{news.to_detail}</td>
                                    <td style={{ width: columnWidths.link }} onMouseDown={(e) => handleMouseDown(e, 'link')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>{news.link}</td>
                                    <td style={{ width: columnWidths.to_link }} onMouseDown={(e) => handleMouseDown(e, 'to_link')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`}>{news.to_link}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No news found.</p>
                )}
            </div>
        </div>
    );
};



export default LogActionNews;
