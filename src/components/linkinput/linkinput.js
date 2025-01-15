import React, { useState } from 'react';
import { Link, Loader2 } from 'lucide-react';
import './linkinput.css';

const LinkInput = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (url) {
      setIsLoading(true);
      await onSubmit(url);
      setIsLoading(false);
    }
  };

  return (
    <div className="link-input-container">
      {/* Grid overlay */}
      <div className="grid-overlay"></div>
      
      {/* Ambient glow */}
      <div className="ambient-glow"></div>

      <div className="input-content">
        <div className="input-header">
          <Link className="link-icon" />
          <h2 className="input-title">URL Scanner</h2>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
            <input
              type="url"
              placeholder="Enter URL to analyze..."
              value={url}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="link-input"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={!url || isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Analyze URL'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LinkInput;