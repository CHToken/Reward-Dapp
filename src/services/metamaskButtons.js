import React from "react";
import {
  MetaMaskButton,
  useAccount,
} from "@metamask/sdk-react-ui";
// import Button from "@mui/material/Button";

const MetamaskButtons = () => {
  const { connect, disconnect } = useAccount();

  const handleConnect = async () => {
    try {
      await connect();
      // Additional logic after successful connection if needed
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      // Handle connection error if needed
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      // Additional logic after successful disconnection if needed
    } catch (error) {
      console.error("Error disconnecting from MetaMask:", error);
      // Handle disconnection error if needed
    }
  };

  return (
    <div>
      <MetaMaskButton theme="light" color="white" onConnect={handleConnect} onDisconnect={handleDisconnect}/>
    </div>
  );
};

export default MetamaskButtons;
