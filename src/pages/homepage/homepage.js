// src/pages/HomePage/HomePage.js

import React, { useState } from 'react';
import './homepage.css';
import Header from '../../components/Header/header';
import Footer from '../../components/footer/footer';
import LinkInput from '../../components/linkinput/linkinput';
import LinkPreview from '../../components/linkpreview/linkpreview';

const HomePage = () => {
  const [url, setUrl] = useState('');

  const handleLinkSubmit = (submittedUrl) => {
    setUrl(submittedUrl);
  };

  return (
    <div className="home-page">
      <Header />
      <div className="content">
        <h2>Enter a URL to preview</h2>
        <LinkInput onSubmit={handleLinkSubmit} />
        {url && <LinkPreview url={url} />}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
