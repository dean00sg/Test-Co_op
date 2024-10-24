import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/requestnews.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const RequestNews = () => {
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
  const [images, setImages] = useState({}); // Store image URLs
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
      setError('Failed to submit news. Please try again.');
      setSuccessMessage(null);
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

  // Fetch image for each news item
  const fetchImageForNews = async (news_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/news_image/${news_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob', // Ensure we get binary data (image)
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
      const userNews = newsList.filter((news) => news.request_By === user.user_id);
      setFilteredNews(userNews);

      // Fetch images for all filtered news items
      userNews.forEach((news) => {
        fetchImageForNews(news.news_id);
      });
    }
  }, [user, newsList]);

  return (
    <div className="form-container">
      <div className="form-card">
        <form onSubmit={handleSubmit} className="news-form">
          <div className="form-row">
            <label>Header :</label>
            <input type="text" name="header" onChange={handleChange} value={formData.header} />
          </div>

          <div className="formdetail-row">
            <label>Details :</label>
            <textarea
              name="detail"
              onChange={handleChange}
              value={formData.detail}
              placeholder="Enter details here..."
            />
          </div>

          <div className="form-row">
            <label>Image News :</label>
            <input type="file" name="image_news" onChange={handleChange} />
          </div>

          <div className="form-row">
            <label>Link :</label>
            <input type="text" name="link" onChange={handleChange} value={formData.link} />
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>

      <div className="form-card">
        <h3>Your Submitted News</h3>
        <div className="news-table">
          {filteredNews.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Image</th>
                  <th>Details</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((news) => (
                  <tr key={news.news_id}>
                    <td>{news.header}</td>
                    <td>
                      {images[news.news_id] ? (
                        <img src={images[news.news_id]} alt={news.header} width="100" />
                      ) : (
                        'No image available'
                      )}
                    </td>
                    <td>{news.detail}</td>
                    <td>
                      {news.link ? (
                        <a href={news.link} target="_blank" rel="noopener noreferrer">
                          View Link
                        </a>
                      ) : 'N/A'}
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
    </div>
  );
};

export default RequestNews;
