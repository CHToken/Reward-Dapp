import React, { useState, useEffect } from 'react';
import TokenClaimABI from '../contracts/TokenClaim.json';
import { CONTRACT_ADDRESS } from '../config';
import { notification, Spin, Typography } from 'antd';
import './Home.css';
import Web3 from 'web3';
import moment from 'moment';

const { Paragraph } = Typography;

const Home = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [web3Instance, setWeb3Instance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRewardsPaused, setIsRewardsPaused] = useState(true);
  const [gettotalRewards, setgetTotalRewards] = useState(0);
  const [unclaimedTokens, setUnclaimedTokens] = useState(0);
  const [nextClaimTime, setNextClaimTime] = useState(0);
  const [claimingTokens, setClaimingTokens] = useState(false);
  const [rewardPerClaim, setRewardPerClaim] = useState(0);
  const [updatingTokens, setUpdatingTokens] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const web3 = new Web3(window.ethereum);
          setWeb3Instance(web3);
  
          // Enable autoRefreshOnNetworkChange to avoid memory leak
          web3.eth.handleRevert = true;
          web3.eth.autoRefreshOnNetworkChange = false;
  
          const accounts = await web3.eth.getAccounts();
          const currentAccount = accounts[0] || '';
  
          setAccount(currentAccount);
  
          // Always attempt to fetch data, even if not connected
          const contractInstance = new web3.eth.Contract(TokenClaimABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
  
          const contractState = await contractInstance.methods.contractState().call();
          const gettotalRewards = await contractInstance.methods.getTotalRewards().call();
          // Use getUpdatedUnclaimedTokens to get the latest unclaimedTokens value
          const updatedUnclaimedTokens = await contractInstance.methods.getUpdatedUnclaimedTokens(currentAccount).call();
          const rewardPerClaim = await contractInstance.methods.rewardPerClaim().call();
          const nextClaimTime = await contractInstance.methods.getNextClaimTime(currentAccount).call();
  
          setIsConnected(accounts.length > 0);
          setIsRewardsPaused(contractState > '0');
          setgetTotalRewards(web3.utils.fromWei(gettotalRewards, 'ether'));
          // Update unclaimedTokens with the latest value
          setUnclaimedTokens(web3.utils.fromWei(updatedUnclaimedTokens, 'ether'));
          setRewardPerClaim(web3.utils.fromWei(rewardPerClaim, 'ether'));
          setNextClaimTime(nextClaimTime);
  
          console.log('Data Fetched Successfully');
          console.log("Updated Total Rewards:", (web3.utils.fromWei(gettotalRewards, 'ether')));
      } catch (error) {
          console.error('Error initializing web3:', error);
      }
  };  

    fetchData();

    // Set up an interval to fetch data every 10 seconds
    const intervalId = setInterval(fetchData, 10000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const handleClaimTokens = async () => {
    try {
      setClaimingTokens(true);
      if (!isConnected || !account || !contract || !web3Instance) {
        console.error('Account, contract, or web3Instance not initialized. Cannot claim tokens.');
  
        // Show notification to connect wallet
        notification.warning({
          message: 'Wallet Not Connected',
          description: 'Please connect your wallet to claim tokens.',
        });
  
        return;
      }
  
      // Continue with claiming tokens
      await contract.methods.claimTokens().send({ from: account });
  
      // Show success notification
      notification.success({
        message: 'Tokens Claimed',
        description: 'Tokens have been successfully claimed.',
      });
  
    } catch (error) {
      console.error('Error claiming tokens:', error);
      notification.error({
        message: 'Claim Tokens Failed',
        description: 'There was an error while claiming tokens. Please try again.',
      });
    }
    finally {
      // Set the loading state back to false, whether the claim was successful or not
      setClaimingTokens(false);
    }
  };

  const formatTime = (seconds) => {
    const duration = moment.duration(Number(seconds), 'seconds');
    const nextClaimTimeUTC = moment.utc(duration.asMilliseconds()).toDate();

    // Get the user's local time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format the nextClaimTime in the user's local time zone
    const formattedTime = nextClaimTimeUTC.toLocaleTimeString(undefined, {
      timeZone: userTimeZone,
      hour12: true, // Use 24-hour format
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });

    return formattedTime;
  };

  const handleUpdateTokens = async () => {
    try {
      setUpdatingTokens(true);
  
      if (!isConnected || !account || !contract || !web3Instance) {
        console.error('Account, contract, or web3Instance not initialized. Cannot update tokens.');
  
        // Show notification to connect wallet
        notification.warning({
          message: 'Wallet Not Connected',
          description: 'Please connect your wallet to update tokens.',
        });
  
        return;
      }
  
      // Continue with updating tokens
      await contract.methods.getUpdatedUnclaimedTokens(account).send({ from: account });
  
      // Show success notification
      notification.success({
        message: 'Tokens Updated',
        description: 'Tokens have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating tokens:', error);
      notification.error({
        message: 'Update Tokens Failed',
        description: 'There was an error while updating tokens. Please try again.',
      });
    } finally {
      // Set the loading state back to false, whether the update was successful or not
      setUpdatingTokens(false);
    }
  };  

  return (
    <div className="dashboard-section">
      <div className="dashboard-container">
        {/* Countdown for Next Claim Time */}
        <div className="countdown-container">
          <h4>Next Claim</h4>
          <p>{formatTime(nextClaimTime)}</p>
        </div>

        {/* First Row */}
        <div className="row-container">
          <div className="card-Items">
            <div className="card total-balance">
              <h4 className="card-title">Total Rewards</h4>
              <p>{gettotalRewards} SWORD</p>
            </div>
          </div>
          <div className="card-Items">
            <div className="card reward-per-claim">
              <h4 className="card-title">Reward Per Claim</h4>
              <p>{rewardPerClaim} SWORD</p>
            </div>
          </div>
          <div className="card-Items">
            <div className="card rewards-state">
              <h4 className="card-title">Reward Status</h4>
              <p>{isRewardsPaused ? 'Paused' : 'Resumed'}</p>
            </div>
          </div>
          <div className="card-Items">
            <div className="card unclaimed-tokens">
              <h4 className="card-title">Unclaimed Tokens</h4>
              <p>{unclaimedTokens} SWORD</p>
            </div>
          </div>
        </div>
        
         {/* Message about updating tokens */}
         <Paragraph style={{ marginBottom: '16px', color: 'white' }}>
          Click the button below to update your unclaimedTokens and avoid forfeiture.
        </Paragraph>

        {/* Customized Spin component for loading indicator */}
        <Spin
          spinning={claimingTokens || updatingTokens}
          tip="Loading..."
          size="large"
          wrapperClassName="custom-spin-wrapper"
        >

          {/* Buttons container with conditional styling */}
          <div className={`buttons-container ${updatingTokens ? 'column-layout' : 'row-layout'}`}>
            {/* Claim Tokens button */}
            <button
              className="claim-button"
              onClick={handleClaimTokens}
              disabled={!isConnected || isRewardsPaused || claimingTokens}
            >
              Claim Tokens
            </button>

            {/* Update Tokens button */}
            <button
              className="update-tokens-button"
              onClick={handleUpdateTokens}
              disabled={!isConnected || isRewardsPaused ||  updatingTokens}
            >
              Update Tokens
            </button>
          </div>
          
        </Spin>
      </div>
    </div>
  );
};

export default Home;