import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './requestnews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

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
  const [images, setImages] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editNewsId, setEditNewsId] = useState(null);
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
    form.append('link', formData.link);
    if (formData.image_news) {
      form.append('image_news', formData.image_news);
    }

    try {
      if (isEditing) {
        // Update news if editing
        await axios.put(`${API_BASE_URL}/news/news/${editNewsId}`, form, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Use multipart/form-data for file uploads
          },
        });
        setSuccessMessage('News updated successfully!');
        setIsEditing(false);
        setEditNewsId(null);
      } else {
        // Create new news
        await axios.post(`${API_BASE_URL}/news/news`, form, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccessMessage('News submitted successfully!');
      }
      setError(null);
      setFormData({ header: '', detail: '', image_news: null, link: '' });
      fetchAllNews();
    } catch (error) {
      setError(error.response?.data.detail || 'Failed to submit news. Please try again.');
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

  const handleEdit = (news) => {
    setFormData({
      header: news.header,
      detail: news.detail,
      image_news: null,
      link: news.link,
    });
    setIsEditing(true);
    setEditNewsId(news.news_id);
  };

  const handleCancel = () => {
    setFormData({
      header: '',
      detail: '',
      image_news: null,
      link: ''
    });
    setIsEditing(false);
    setEditNewsId(null);
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

  useEffect(() => {
    fetchAllNews();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user && newsList.length > 0) {
      const userNews = newsList.filter((news) => news.request_By === user.user_id);
      setFilteredNews(userNews);

      userNews.forEach((news) => {
        fetchImageForNews(news.news_id);
      });
    }
  }, [user, newsList]);

  return (
    <div className="form-container">
      <div className="formnews-card">
        <form onSubmit={handleSubmit} className="news-form">
          <div className="form-row">
            <label>Header :</label>
            <input type="text" name="header" onChange={handleChange} value={formData.header} required />
          </div>

          <div className="formdetail-row">
            <label>Details :</label>
            <textarea
              name="detail"
              onChange={handleChange}
              value={formData.detail}
              placeholder="Enter details here..."
              required
            />
          </div>

          <div className="form-row">
            <label>Image News :</label>
            <input type="file" name="image_news" onChange={handleChange} />
          </div>

          <div className="form-row" >
            <label>Link :</label>
            <input type="text" name="link" onChange={handleChange} value={formData.link} />
          </div>

          <div className="button-group">
            <button type="submit">{isEditing ? 'Update' : 'Submit'}</button>
            {isEditing && <button type="button" onClick={handleCancel}>Cancel</button>}
          </div>
        </form>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="form-card">
        <h3>Your Submitted News</h3>
        <div className="news-table">
          {filteredNews.length > 0 ? (
            <table className='news-profile-table'>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Image</th>
                  <th>Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((news) => (
                  <tr key={news.news_id}>
                    <td >
                        <div className='intable_box_table'>
                          {news.header}
                        </div>
                      </td>
                    <td>
                      {images[news.news_id] ? (
                        <img src={images[news.news_id]} alt={news.header} width="100" />
                      ) : (
                        'No image available'
                      )}
                    </td>
                    <td >
                      <div className='intable_box_table'>
                        {news.detail}
                      </div>
                      </td>
                    <td style={{ textAlign: 'center' }}>
                
                        <div className="icon-actions">
                            <FontAwesomeIcon 
                                icon={faEdit} 
                                className="fa-icon edit" 
                                onClick={() => handleEdit(news)} 
                            />
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
          ) : (
            <p>No news submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestNews;
