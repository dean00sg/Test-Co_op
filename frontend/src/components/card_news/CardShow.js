import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'; // Importing the icon
import './cardshow.css';

const CardShowNews = () => {
  const [newsData, setNewsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});

  // Function to fetch news data
  const fetchNewsData = async () => {
    try {
      const response = await fetch('http://localhost:8000/news/news');
      const data = await response.json();

      // Filter to include only approved news
      const approvedNews = data.filter(news => news.status_approve === "approve");

      const newsWithImages = await Promise.all(
        approvedNews.map(async (news) => {
          const imageResponse = await fetch(`http://localhost:8000/news/news_image/${news.news_id}`);
          const imageBlob = await imageResponse.blob();
          const imageObjectURL = URL.createObjectURL(imageBlob);
          return { ...news, imageURL: imageObjectURL };
        })
      );
      setNewsData(newsWithImages);
    } catch (error) {
      console.error('Error fetching news data:', error);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? newsData.length - 3 : prevIndex - 3
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 3 >= newsData.length ? 0 : prevIndex + 3
    );
  };

  const toggleReadMore = (id) => {
    setExpandedCards((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const openLink = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="card-carousel">
      <div className="card-container">
        {newsData.slice(currentIndex, currentIndex + 3).map((news) => (
          <div className="card" key={news.news_id}>
            <div className="card-image">
              <img src={news.imageURL} alt={news.header} />
            </div>
            <div className="card-content">
              <h3>{news.header}</h3>
              <p>
                {expandedCards[news.news_id]
                  ? news.detail
                  : `${news.detail.slice(0, 100)}...`}
              </p>
              <button
                className="view-more-btn"
                onClick={() => toggleReadMore(news.news_id)}
              >
                {expandedCards[news.news_id] ? 'Read Less' : 'Read More'}
              </button>
              {/* Button to open link with an icon */}
              <button
                className="open-link-btn"
                onClick={() => openLink(news.link)}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-controls">
        <button className="prev-btn" onClick={handlePrevClick}>
          ❮
        </button>
        <button className="next-btn" onClick={handleNextClick}>
          ❯
        </button>
      </div>
    </div>
  );
};

export default CardShowNews;
