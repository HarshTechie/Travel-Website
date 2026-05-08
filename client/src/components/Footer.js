import React from 'react';
import '../styles/Hero.css';

const Footer = () => {
  return (
    <footer className="footer-contact">
      <div className="footer-container">
        {/* Contact Info */}
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>
            <strong>Phone:</strong> 93780-54612
          </p>
          <p>
            <strong>Help-line:</strong> 19005-00023
          </p>
          <p>
            <strong>Email:</strong> support@trailbliss.com
          </p>
        </div>

        {/* Social Media Links */}
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
            >
              🌐
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
            >
              🐦
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
            >
              📘
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
            >
              📸
            </a>
          </div>
        </div>

        {/* About */}
        <div className="footer-section about">
          <h3>TrailBliss</h3>
          <p>
            Your ultimate travel companion. Explore, plan, and enjoy
            unforgettable trips.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 TrailBliss. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
