// Header.js
import React from 'react';
import MetamaskButtons from '../services/metamaskButtons';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-container">
        <img src={require('./logo.jpg')} alt="Logo" className="logo" />
      </div>
      <nav className="menu-container">
        <ul className="menu">
          <li className='dashboard'>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/rewards">Rewards</a>
          </li>
        </ul>
      </nav>
      <div className="metamask-container">
        <MetamaskButtons />
      </div>
    </header>
  );
};

export default Header;