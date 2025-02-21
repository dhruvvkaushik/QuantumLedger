// filepath: /gasless-forwarder/gasless-forwarder/frontend/src/context/Web3Context.jsx
/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import ForwarderContract from '../contracts/Forwarder.json';

export const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [forwarder, setForwarder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    console.log('Attempting to connect wallet...');
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        console.log('Web3 instance created.');

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        const netId = await web3Instance.eth.net.getId();

        const networkData = ForwarderContract.networks[netId];
        if (networkData) {
          const forwarderInstance = new web3Instance.eth.Contract(
            ForwarderContract.abi,
            networkData.address
          );
          setForwarder(forwarderInstance);
        } else {
          const localContractAddress = "0x14c205c5084c8eFa6cd9BE45b31a8c38AbE5708b";
          const forwarderInstance = new web3Instance.eth.Contract(
            ForwarderContract.abi,
            localContractAddress
          );
          setForwarder(forwarderInstance);
        }

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setNetworkId(netId);
        setError(null);
      } else {
        throw new Error('Please install MetaMask');
      }
    } catch (err) {
      console.error('Error during wallet connection:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  return (
    <Web3Context.Provider
      value={{
        web3,
        account,
        networkId,
        forwarder,
        loading,
        error,
        connectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};