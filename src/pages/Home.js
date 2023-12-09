import React, { useState, useEffect } from 'react';
import TokenClaimABI from '../contracts/TokenClaim.json';
import { CONTRACT_ADDRESS } from '../config';
import './Home.css';
import Web3 from 'web3';
import moment from 'moment';

const Home = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [web3Instance, setWeb3Instance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRewardsPaused, setIsRewardsPaused] = useState(false);
  const [totalRewards, setTotalRewards] = useState(0);
  const [unclaimedTokens, setUnclaimedTokens] = useState(0);
  const [nextClaimTime, setNextClaimTime] = useState(0);
  const [rewardPerClaim, setRewardPerClaim] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const web3 = new Web3(window.ethereum || 'http://localhost:7545');
        setWeb3Instance(web3);

        // Enable autoRefreshOnNetworkChange to avoid memory leak
        web3.eth.handleRevert = true;
        web3.eth.autoRefreshOnNetworkChange = false;

        const accounts = await web3.eth.getAccounts();

        if (accounts.length === 0) {
          console.error('No accounts found. Please connect your wallet.');
          setIsConnected(false);
          return;
        }

        setAccount(accounts[0]);
        setIsConnected(true);

        const contractInstance = new web3.eth.Contract(TokenClaimABI, CONTRACT_ADDRESS);
        setContract(contractInstance);

        const isPaused = await contractInstance.methods.contractState().call() === '1';
        const totalRewards = await contractInstance.methods.totalRewards().call();
        const unclaimedTokens = await contractInstance.methods.getUpdatedUnclaimedTokens(account).call();
        const rewardPerClaim = await contractInstance.methods.rewardPerClaim().call();

        setIsRewardsPaused(isPaused);
        setTotalRewards(web3.utils.fromWei(totalRewards, 'ether'));
        setUnclaimedTokens(web3.utils.fromWei(unclaimedTokens, 'ether'));
        setRewardPerClaim(web3.utils.fromWei(rewardPerClaim, 'ether'));

        console.log('Data Fetched Successfully');
      } catch (error) {
        console.error('Error initializing web3:', error);
      }
    };

    fetchData();
  }, [account]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (account && contract) {
        const nextClaimTime = await contract.methods.getNextClaimTime(account).call();
        setNextClaimTime(nextClaimTime);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [account, contract]);

  const handleClaimTokens = async () => {
    try {
      if (!isConnected || !account || !contract || !web3Instance) {
        console.error('Account, contract, or web3Instance not initialized. Cannot claim tokens.');
        return;
      }

      await contract.methods.claimTokens().send({ from: account });
    } catch (error) {
      console.error('Error claiming tokens:', error);
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
              <p>{totalRewards}</p>
            </div>
          </div>
          <div className="card-Items">
            <div className="card reward-per-claim">
              <h4 className="card-title">Reward Per Claim</h4>
              <p>{rewardPerClaim}</p>
            </div>
          </div>
          <div className="card-Items">
            <div className="card rewards-paused">
              <h4 className="card-title">Rewards Paused</h4>
              <p>{isRewardsPaused ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <div className="card-Items">
            <div className="card unclaimed-tokens">
              <h4 className="card-title">Unclaimed Tokens</h4>
              <p>{unclaimedTokens}</p>
            </div>
          </div>
        </div>
        <button className="claim-button" onClick={handleClaimTokens} disabled={!isConnected || isRewardsPaused}>
          Claim Tokens
        </button>
      </div>
    </div>
  );
};

export default Home;
