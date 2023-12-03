// // services/web3.js
// import TokenClaimContract from '../contracts/TokenClaim.json';
// import { CONTRACT_ADDRESS } from '../config';
// import Web3 from 'web3';

// const initWeb3Instance = async (connectCallback) => {
//   try {
//     // Create a new instance of Web3
//     const web3Instance = new Web3();

//     // Use MetaMask provider if available
//     if (window.ethereum) {
//       web3Instance.setProvider(window.ethereum);

//       // Check if connectCallback is a function before invoking it
//       if (typeof connectCallback === 'function') {
//         // Call connectCallback when connecting
//         await connectCallback(() => window.ethereum.request({ method: 'eth_requestAccounts' }));
//       } else {
//         throw new Error('connectCallback must be a function');
//       }
//     } else {
//       throw new Error('MetaMask not detected. Please install MetaMask to use this DApp.');
//     }

//     return web3Instance;
//   } catch (error) {
//     throw new Error(`Error initializing web3: ${error.message}`);
//   }
// };

// const getContractInstance = async () => {
//   const web3Instance = await initWeb3Instance(() => {});
//   const networkId = await web3Instance.eth.net.getId();
//   const deployedNetwork = TokenClaimContract.networks[networkId];
//   if (deployedNetwork) {
//     return new web3Instance.eth.Contract(TokenClaimContract.abi, CONTRACT_ADDRESS);
//   } else {
//     throw new Error('Contract not deployed on the current network');
//   }
// };

// export { initWeb3Instance, getContractInstance };
