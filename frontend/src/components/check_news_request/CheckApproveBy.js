import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import '../request_news/statusnews.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const NewsApproveBy = ({ currentTable }) => {
    const [newsList, setNewsList] = useState([]);
    const [images, setImages] = useState({});
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

    const fetchImageForNews = async (status_id) => { // Change from news_id to status_id
        try {
            const response = await axios.get(`${API_BASE_URL}/log_image_status/${status_id}`, { // Use status_id in the URL
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });
            const imageURL = URL.createObjectURL(response.data);
            setImages((prevImages) => ({ ...prevImages, [status_id]: imageURL })); // Change from news_id to status_id
        } catch (error) {
            console.error(`Failed to fetch image for status_id: ${status_id}`); // Change from news_id to status_id
        }
    };

    useEffect(() => {
        fetchAllNews();
    }, []);

    useEffect(() => {
        if (newsList.length > 0) {
            newsList.forEach((news) => {
                fetchImageForNews(news.status_id); // Change from news.news_id to news.status_id
            });
        }
    }, [newsList]);

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
            <div className="news-table">
                <table className='news-profile-table'>
                    <thead>
                        <tr>
                            <th>News ID</th>
                            <th>News Image</th>
                            <th>Header</th>
                            <th>Status Approve</th>
                            <th>Request By</th>
                            <th>Request Role</th>
                            <th>Status Approved</th>
                            <th>Approved By</th>
                            <th>Approved Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newsList.map((news) => (
                            <tr key={news.status_id}>
                                <td className='intable_box_table'>{news.news_id}</td>
                                <td className='intable_box_table'>
                                    {images[news.status_id] ? ( // Change from news.news_id to news.status_id
                                        <img src={images[news.status_id]} alt={news.header} width="100" />
                                    ) : (
                                        'No image available'
                                    )}
                                </td>
                                <td className='intable_box_table'>{news.header || ''}</td>
                                <td className='intable_box_table'>
                                    {/* เพิ่มไอคอนตามสถานะการอนุมัติ */}
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
                                <td className='intable_box_table'>
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
                                <td className='intable_box_table'>
                                    {/* เพิ่มไอคอนในสถานะการอนุมัติ */}
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
                                <td className='intable_box_table'>
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
                                <td className='intable_box_table'>
                                    {news.approve_byrole || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NewsApproveBy;
