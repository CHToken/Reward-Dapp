// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Header from './pages/Header';
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";
import './styles/App.css';

const App = () => {
  return (
    <MetaMaskUIProvider
      debug={false}
      sdkOptions={{
        checkInstallationImmediately: false,
        dappMetadata: {
          name: "Reward DApp",
          url: window.location.host,
        },
      }}
    >
      <Router>
        <div className="app-container">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </MetaMaskUIProvider>
  );
};

export default App;
