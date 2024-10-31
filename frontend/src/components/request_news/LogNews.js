import React, { useEffect, useState } from 'react';
import { useNews } from './NewsProvider';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faFilePen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000';
const LogNews = ({ onUpdate }) => {
    const { logNewsList, user } = useNews();
    const [images, setImages] = useState({});
    const [filteredNews, setFilteredNews] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (user && logNewsList.length > 0) {
            const userNews = logNewsList
                .filter((news) => news.user_id === user.user_id)
                .sort((a, b) => b.id - a.id) // Sort from highest to lowest id
                .slice(0, 15); // Select the latest 15 entries

            setFilteredNews(userNews);

            userNews.forEach((news) => {
                fetchImageForNews(news.id);
            });
        }
    }, [user, logNewsList]);

    const fetchImageForNews = async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/news/Log_tonews_image/{news_id}?log_id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const imageURL = URL.createObjectURL(response.data);
            setImages((prevImages) => ({ ...prevImages, [id]: imageURL }));
        } catch (error) {
            console.error(`Failed to fetch image for news_id: ${id}`, error);
        }
    };

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
                                <tr key={news.id}>
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
