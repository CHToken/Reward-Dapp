import React from "react";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

const projectId = 'b12db8edf7f9cb0d92887047381eb85a';

const ethereumMainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
  }

const ethereumGoerli = {
  chainId: 5,
  name: 'Ethereum Goerli',
  currency: 'GTH',
  explorerUrl: 'https://goerli.etherscan.io',
  rpcUrl: 'https://goerli.infura.io/v3/774a0b18d6ae4f9cabbb1458da880e5b'
};

const metadata = {
  name: 'Sword Bot Reward Dapp',
  description: 'This is just a reward Dapp for holder of sword token',
  url: 'https://swordbot.online/',
  icons: ['https://swordbot.online/images/logo.png']
};


createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [ethereumMainnet, ethereumGoerli],
    projectId
  })

  export default function ConnectButton() {
    return <w3m-button />
  }