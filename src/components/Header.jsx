import React from 'react';
import './Header.css';

const Header = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/330px-Flag_of_Algeria.svg.png" 
            alt="Algeria Flag" 
            className="flag-logo"
          />
          <h1 className="team-title">Algeria National Football Team</h1>
        </div>
        
        <nav className="navigation">
          <ul className="nav-list">
            <li><a href="#home" className="nav-link active" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
            <li><a href="#news" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('news'); }}>News</a></li>
            <li><a href="#history" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('history'); }}>History</a></li>
            <li><a href="#squad" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('squad'); }}>Squad</a></li>
            <li><a href="#stats" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }}>Stats</a></li>
          </ul>
        </nav>
        
        <div className="header-actions">
          <button className="search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="menu-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="profile-btn">
            <div className="profile-avatar">A</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
