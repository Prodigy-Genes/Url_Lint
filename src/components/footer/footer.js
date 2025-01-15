import React from 'react';
import { Shield, Instagram, Twitter, Linkedin, Github } from 'lucide-react';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      {/* Grid overlay for tech effect */}
      <div className="grid-overlay"></div>
      
      {/* Ambient glow */}
      <div className="ambient-glow"></div>

      <div className="footer-content">
        <div className="footer-main">
          {/* Brand section */}
          <div className="brand-section">
            <Shield className="shield-icon" />
            <p className="copyright">
              &copy; {currentYear} <span className="brand-text">UrlLint</span>
            </p>
          </div>

          {/* Social icons */}
          <div className="social-icons">
            <a href="https://www.instagram.com/prodigygenes?igsh=Ymp4cHQxaTJmamc5" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="social-icon" />
            </a>
            <a href="https://x.com/ProdigyGenes?t=KT8YRprhOGSjeas86E_Hjw&s=09" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter className="social-icon" />
            </a>
            <a href="https://www.linkedin.com/in/osei-joseph-aboagye-2a3a13238?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="social-icon" />
            </a>
            <a href="https://github.com/Prodigy-Genes" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="social-icon" />
            </a>
          </div>
        </div>

        <div className="credit-text">
          Tagged <span className="highlight">ProdigyGenes</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;