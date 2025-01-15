import React, { useState, useEffect } from 'react';
import { Shield, Terminal } from 'lucide-react';
import './header.css';

const Header = () => {
  const [glowActive, setGlowActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowActive(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      {/* Ambient glow effect */}
      <div className="ambient-glow"></div>
      
      {/* Grid overlay for tech effect */}
      <div className="grid-overlay"></div>
      
      {/* Main content */}
      <div className="header-content">
        {/* Logo section */}
        <div className="logo-section">
          <Shield className={`shield-icon ${glowActive ? 'glow-active' : ''}`} />
          <div className="brand">
            <h1 className="brand-text">UrlLint</h1>
            <Terminal className="terminal-icon" />
          </div>
        </div>
        
      </div>
    </header>
  );
};

export default Header;