// src/components/LinkInput/LinkInput.js

import React, { useState } from 'react';
import './linkinput.css';

const LinkInput = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onSubmit(url);
    }
  };

  return (
    <div className="link-input-container">
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter a URL"
          value={url}
          onChange={handleInputChange}
          className="link-input"
        />
        <button type="submit" className="submit-btn">Preview Link</button>
      </form>
    </div>
  );
};

export default LinkInput;
