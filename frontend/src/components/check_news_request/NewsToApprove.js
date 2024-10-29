import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../request_news/statusnews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf, faTrashAlt, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import NewsApproveBy from './CheckApproveBy';
import LogActionNews from './LogActionNews';

const API_BASE_URL = 'http://127.0.0.1:8000';

const NewsApprove = ({ currentTable }) => {
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
    const [searchTerm, setSearchTerm] = useState({ newsId: '', header: '', status_approve: '' });
    const [columnWidths, setColumnWidths] = useState({ datetime: 100 }); // Initialize column widths
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
            setFilteredNews(response.data); // Initialize filtered news with all news
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
        const { newsId, header, status_approve } = searchTerm;
        const filtered = newsList.filter(news =>
            (newsId ? news.news_id.toString().includes(newsId) : true) &&
            (header ? news.header.toLowerCase().includes(header.toLowerCase()) : true) &&
            (status_approve ? news.status_approve.toLowerCase() === status_approve.toLowerCase() : true)
        );
        setFilteredNews(filtered);
    };

    const handleResetSearch = () => {
        setSearchTerm({ newsId: '', header: '', status_approve: '' });
        setFilteredNews(newsList); // Show all news again
    };

    useEffect(() => {
        fetchAllNews();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user && newsList.length > 0) {
            setFilteredNews(newsList); // Initialize filtered news with all news
            newsList.forEach((news) => {
                fetchImageForNews(news.news_id);
            });
        }
    }, [user, newsList]);

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
            {/* Check if currentTable is 'all' to render the header and table */}
            {currentTable === 'all' && (
                <div className="flex-header">
                    <h2>All The News And Status Show</h2>
                    <h className='advice-red'>
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        You can adjust the table width by dragging the resize handle at the top of the table header.
                    </h>
                    {/* Search Inputs */}
                    <div className="searchtable-container">
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
                        <select
                            value={searchTerm.status_approve}
                            onChange={(e) => setSearchTerm({ ...searchTerm, status_approve: e.target.value })}
                        >
                            <option value="" disabled>Status Show</option>
                            <option value="approve">Approve</option>
                            <option value="request">Request</option>
                        </select>

                        <button className='Search' onClick={handleSearch}>Search</button>
                        <button className='resetSearch' onClick={handleResetSearch}>Reset Search</button>
                    </div>
                </div>
            )}

            <div className="news-table">
                {currentTable === 'all' ? (
                    <table className='lognews-table'>
                        <thead>
                            <tr>
                                <th>News ID</th>
                                <th style={{ width: columnWidths.datetime  }} onMouseDown={(e) => handleMouseDown(e, 'datetime')}>DateTime Request</th>
                                <th>News Image</th>
                                <th style={{ width: columnWidths.header }} onMouseDown={(e) => handleMouseDown(e, 'header')}>Header</th>
                                <th style={{ width: columnWidths.detail }} onMouseDown={(e) => handleMouseDown(e, 'detail')}>Detail</th>
                                <th style={{ width: columnWidths.link }} onMouseDown={(e) => handleMouseDown(e, 'link')}>Link</th>
                                <th>Status Show</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNews.map((news) => (
                                <tr key={news.news_id}>
                                    <td className='intable_box_table'>{news.news_id}</td>
                                    <td style={{ width: columnWidths.action_datetime  }} onMouseDown={(e) => handleMouseDown(e, 'action_datetime')} className={`intable_box ${news.action_name === 'delete' ? 'deleted' : ''}`} >{formatDateTime(news.datetime)}</td>
                                    <td  className='intable_box_table' >
                                        {images[news.news_id] ? (
                                            <img src={images[news.news_id]} alt={news.header} width="100" />
                                        ) : (
                                            'No image available'
                                        )}
                                    </td>
                                    <td  style={{ width: columnWidths.header }} onMouseDown={(e) => handleMouseDown(e, 'header')} className='intable_box_table'>{news.header}</td>
                                    <td  style={{ width: columnWidths.detail }} onMouseDown={(e) => handleMouseDown(e, 'detail')} className='intable_box_table'>{news.detail}</td>
                                    <td  style={{ width: columnWidths.link}} onMouseDown={(e) => handleMouseDown(e, 'link')} className='intable_box_table'>{news.link}</td>
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
                ) : currentTable === 'Log' ? (
                    <LogActionNews />
                ) : (
                    <div>
                        <NewsApproveBy />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsApprove;
