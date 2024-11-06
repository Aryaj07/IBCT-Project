import Web3 from 'web3';

let web3;

if (window.ethereum) {
  // Use MetaMask's provider
  web3 = new Web3(window.ethereum);
  window.ethereum.request({ method: 'eth_requestAccounts' });  // Request access to the wallet
} else {
  console.log("No Ethereum provider detected. Please install MetaMask.");
}

export default web3;
