import React, { useState, useEffect } from 'react';
import TokenClaimABI from '../contracts/TokenClaim.json';
import './Home.css';


const Home = () => {
  const [contract, setContract] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const [rewardsClaimed, setRewardsClaimed] = useState(0);
  const [pastRewards, setPastRewards] = useState(0);

  useEffect(() => {
    const initContract = async () => {
      try {
        const contractAddress = '0x7B32A2D3AC69022A374d5DA25a27Ff036E033909';
        const tokenContract = new window.web3.eth.Contract(TokenClaimABI, contractAddress);

        setContract(tokenContract);

        const [totalBalance, totalDistributed, totalWithdrawal, rewardsClaimed, pastRewards] = await Promise.all([
          tokenContract.methods.getRemainingTokens().call(),
          tokenContract.methods.getTotalDistributedRewards().call(),
          tokenContract.methods.getTotalClaimedUsers().call(),
          tokenContract.methods.getTotalClaimedUsers().call(),
          tokenContract.methods.getTotalDistributedRewards().call(),
        ]);

        setTotalBalance(totalBalance);
        setTotalDistributed(totalDistributed);
        setTotalWithdrawal(totalWithdrawal);
        setRewardsClaimed(rewardsClaimed);
        setPastRewards(pastRewards);
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, []);

  const handleClaimTokens = async () => {
    try {
      await contract.methods.claimTokens().send({ from: 'YOUR_USER_ADDRESS' });
      const [totalBalance, totalDistributed, totalWithdrawal, rewardsClaimed, pastRewards] = await Promise.all([
        contract.methods.getRemainingTokens().call(),
        contract.methods.getTotalDistributedRewards().call(),
        contract.methods.getTotalClaimedUsers().call(),
        contract.methods.getTotalClaimedUsers().call(),
        contract.methods.getTotalDistributedRewards().call(),
      ]);

      setTotalBalance(totalBalance);
      setTotalDistributed(totalDistributed);
      setTotalWithdrawal(totalWithdrawal);
      setRewardsClaimed(rewardsClaimed);
      setPastRewards(pastRewards);
    } catch (error) {
      console.error('Error claiming tokens:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="card total-balance">
        <h4 className="card-title">Total Balance</h4>
        <p>{totalBalance}</p>
      </div>
      <div className="card total-distributed">
        <h4 className="card-title">Total Distributed</h4>
        <p>{totalDistributed}</p>
      </div>
      <div className="card total-withdrawal">
        <h4 className="card-title">Total Withdrawal</h4>
        <p>{totalWithdrawal}</p>
      </div>
      <div className="card rewards-claimed">
        <h4 className="card-title">Rewards Claimed</h4>
        <p>{rewardsClaimed}</p>
      </div>
      <div className="card past-rewards">
        <h4 className="card-title">Past Rewards</h4>
        <p>{pastRewards}</p>
      </div>
      <button type="button" onClick={handleClaimTokens} className="claim-button">
        Claim Tokens
      </button>
    </div>
  );
};

export default Home;