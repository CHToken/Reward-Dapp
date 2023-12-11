// Header.js
import React from 'react';
import ConnectButton from '../services/walletConnect';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-container">
        <img src={require('./logo.png')} alt="Logo" className="logo" />
      </div>
      <nav className="menu-container">
        <ul className="menu">
          <li className='dashboard'>
            <span>REWARD DASHBOARD</span>
          </li>
        </ul>
      </nav>
      <div className="metamask-container">
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;
