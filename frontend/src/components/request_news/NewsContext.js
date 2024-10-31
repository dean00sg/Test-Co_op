// NewsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';
const NewsContext = createContext();

export const useNews = () => useContext(NewsContext);

export const NewsProvider = ({ children }) => {
  const [newsList, setNewsList] = useState([]);
  const [logNewsList, setLogNewsList] = useState([]);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  const fetchAllNews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewsList(response.data);

      // Fetch log news immediately after updating newsList
      await fetchLogNews();
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const fetchLogNews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/log_news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogNewsList(response.data);
    } catch (error) {
      console.error('Failed to fetch log news:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  useEffect(() => {
    fetchAllNews();
    fetchUserProfile();
  }, []);

  return (
    <NewsContext.Provider value={{ newsList, logNewsList, user, fetchAllNews, fetchLogNews }}>
      {children}
    </NewsContext.Provider>
  );
};
