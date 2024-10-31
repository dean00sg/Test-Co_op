import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import '../request_news/styles/statusnews.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const NewsApproveBy = ({ currentTable }) => {
    const [newsList, setNewsList] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [images, setImages] = useState({});
    const [searchTerm, setSearchTerm] = useState({ newsId: '', header: '' });
    const [columnWidths, setColumnWidths] = useState({
        news_id: 100,
        header: 200,
        status_approve: 150,
        request_by: 150,
        request_role: 150,
        to_status_approve: 150,
        approve_by: 150,
        approve_role: 150,
    });
    const token = localStorage.getItem('token');

    const fetchAllNews = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/news_status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setNewsList(response.data);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        }
    };

    const fetchImageForNews = async (status_id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/log_image_status/${status_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });
            const imageURL = URL.createObjectURL(response.data);
            setImages((prevImages) => ({ ...prevImages, [status_id]: imageURL }));
        } catch (error) {
            console.error(`Failed to fetch image for status_id: ${status_id}`);
        }
    };

    const handleSearch = () => {
        const filtered = newsList.filter(news =>
            news.news_id.toString().includes(searchTerm.newsId) &&
            (news.header ? news.header.toLowerCase().includes(searchTerm.header.toLowerCase()) : false)
        );
        setFilteredNews(filtered);
    };

    const handleResetSearch = () => {
        setSearchTerm({ newsId: '', header: '' });
        setFilteredNews(newsList);
    };

    useEffect(() => {
        fetchAllNews();
    }, []);

    useEffect(() => {
        if (newsList.length > 0) {
            setFilteredNews(newsList);
            newsList.forEach((news) => {
                fetchImageForNews(news.status_id);
            });
        }
    }, [newsList]);

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
            <div className="flex-header">
                <h2>Check the Approver For The News Request</h2>
                <h className='advice-red'>
                    <FontAwesomeIcon icon={faTriangleExclamation} /> 
                    You can adjust the table width by dragging the resize handle at the top of the table header.
                </h>
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
                    <button className='Search' onClick={handleSearch}>Search</button>
                    <button className='resetSearch' onClick={handleResetSearch}>Reset Search</button>
                </div>
            </div>

            <div className="news-table">
                <table className='lognews-table'>
                    <thead>
                        <tr>
                            <th >News ID</th>
                            <th >News Image</th>
                            <th style={{ width: columnWidths.header }} onMouseDown={(e) => handleMouseDown(e, 'header')} >Header</th>
                            <th style={{ width: columnWidths.status_approve}} onMouseDown={(e) => handleMouseDown(e, 'status_approve')} >Status Approve</th>
                            <th style={{ width: columnWidths.request_byid}} onMouseDown={(e) => handleMouseDown(e, 'request_byid')} >Request By</th>
                            <th >Request Role</th>
                            <th style={{ width: columnWidths.to_status_approve}} onMouseDown={(e) => handleMouseDown(e, 'to_status_approve')} >Status Approved</th>
                            <th  style={{ width: columnWidths.approve_byid}} onMouseDown={(e) => handleMouseDown(e, 'approve_byid')} >Approved By</th>
                            <th >Approved Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(filteredNews.length > 0 ? filteredNews : newsList).map((news) => (
                            <tr key={news.status_id}>
                                <td className='intable_box_table'>{news.news_id}</td>
                                <td className='intable_box_table'>
                                    {images[news.status_id] ? (
                                        <img src={images[news.status_id]} alt={news.header} width="100" />
                                    ) : (
                                        'No image available'
                                    )}
                                </td>
                                <td style={{ width: columnWidths.header }} onMouseDown={(e) => handleMouseDown(e, 'header')} className='intable_box_table'>{news.header || ''}</td>
                                <td style={{ width: columnWidths.status_approve}} onMouseDown={(e) => handleMouseDown(e, 'status_approve')} className='intable_box_table'>
                                    {news.status_approve === 'approve' ? (
                                        <>
                                            <FontAwesomeIcon icon={faCheckCircle} className="faCheckCircle" />
                                            <span className="status-approve approve">{news.status_approve}</span>
                                        </>
                                    ) : news.status_approve === 'request' ? (
                                        <>
                                            <FontAwesomeIcon icon={faHourglassHalf} className="faHourglassHalf" />
                                            <span className="status-approve request">{news.status_approve}</span>
                                        </>
                                    ) : null}
                                    {news.request_datetime ? (
                                        <>
                                            <br />
                                            {formatDateTime(news.request_datetime)}
                                        </>
                                    ) : ''}
                                </td>
                                <td style={{ width: columnWidths.request_byid}} onMouseDown={(e) => handleMouseDown(e, 'request_byid')} className='intable_box_table'>
                                    {news.request_byid && news.request_byname ? (
                                        <div className="profiletable-container">
                                            <img
                                                src={`${API_BASE_URL}/profile/image/${news.request_byid}`}
                                                alt="Requestor Profile"
                                                className="profiletable-image"
                                            />
                                            {news.request_byname}
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                </td>
                                <td className='intable_box_table'>{news.request_byrole || ''}</td>
                                <td style={{ width: columnWidths.to_status_approve}} onMouseDown={(e) => handleMouseDown(e, 'to_status_approve')}  className='intable_box_table'>
                                    {news.to_status_approve === 'approve' ? (
                                        <>
                                            <FontAwesomeIcon icon={faCheckCircle} className="faCheckCircle" />
                                            <span className="status-approved approve">{news.to_status_approve}</span>
                                        </>
                                    ) : news.to_status_approve === 'request' ? (
                                        <>
                                            <FontAwesomeIcon icon={faHourglassHalf} className="faHourglassHalf" />
                                            <span className="status-approved request">{news.to_status_approve}</span>
                                        </>
                                    ) : null}
                                    {news.approve_datetime ? (
                                        <>
                                            <br />
                                            {formatDateTime(news.approve_datetime)}
                                        </>
                                    ) : ''}
                                </td>
                                <td style={{ width: columnWidths.approve_byid}} onMouseDown={(e) => handleMouseDown(e, 'approve_byid')} className='intable_box_table'>
                                    {news.approve_byid && news.approve_byname ? (
                                        <div className="profiletable-container">
                                            <img
                                                src={`${API_BASE_URL}/profile/image/${news.approve_byid}`}
                                                alt="Approver Profile"
                                                className="profiletable-image"
                                            />
                                            {news.approve_byname}
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                </td>
                                <td className='intable_box_table'>{news.approve_byrole || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NewsApproveBy;
