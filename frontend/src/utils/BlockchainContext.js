// frontend/src/utils/BlockchainContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { connectWallet, createContract, getUserRoles } from './blockchain-clean';

/**
 * Blockchain Context for FROST-CHAIN Frontend
 * 
 * Provides blockchain state and functions to all components
 */
export const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainContext.Provider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRoles, setUserRoles] = useState({
    isAdmin: false,
    isProcessor: false,
    isDistributor: false,
    isRetailer: false,
    hasAnyRole: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected on page load
  useEffect(() => {
    console.log('🚀 [CONTEXT] BlockchainProvider mounted');
    
    const checkConnection = async () => {
      console.log('🔍 [CONTEXT] Checking existing wallet connection...');
      console.log('🌐 [CONTEXT] Window.ethereum available:', !!window.ethereum);
      
      if (window.ethereum) {
        console.log('📱 [CONTEXT] Selected address:', window.ethereum.selectedAddress);
      }
      
      try {
        if (window.ethereum && window.ethereum.selectedAddress) {
          console.log('✅ [CONTEXT] Existing connection found, auto-connecting...');
          await connectToWallet();
        } else {
          console.log('ℹ️ [CONTEXT] No existing connection found');
        }
      } catch (error) {
        console.error('❌ [CONTEXT] Failed to check existing connection:', error);
      }
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        connectToWallet();
      }
    };

    const handleChainChanged = () => {
      // Reload the page on chain change
      window.location.reload();
    };

    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  // Load user roles function
  const loadUserRoles = useCallback(async () => {
    try {
      const roles = await getUserRoles(contract, account);
      setUserRoles(roles);
    } catch (error) {
      console.error('Failed to load user roles:', error);
      setUserRoles({
        isAdmin: false,
        isProcessor: false,
        isDistributor: false,
        isRetailer: false,
        hasAnyRole: false
      });
    }
  }, [contract, account]);

  // Update user roles when account changes
  useEffect(() => {
    if (contract && account) {
      loadUserRoles();
    }
  }, [contract, account, loadUserRoles]);

  const connectToWallet = async () => {
    console.log('🚀 [CONTEXT] Starting wallet connection process...');
    try {
      setIsLoading(true);
      console.log('⏳ [CONTEXT] Setting loading state to true');
      
      console.log('🔗 [CONTEXT] Calling connectWallet function...');
      const { provider, signer, account } = await connectWallet();
      console.log('✅ [CONTEXT] Wallet connection successful');
      
      console.log('💾 [CONTEXT] Setting state variables...');
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setIsConnected(true);
      console.log('✅ [CONTEXT] State updated - Connected:', true, 'Account:', account);

      // Create contract instance
      console.log('📄 [CONTEXT] Creating contract instance...');
      const contractInstance = createContract(provider, signer);
      setContract(contractInstance);
      console.log('✅ [CONTEXT] Contract instance created and set');

      toast.success('Wallet connected successfully!');
      console.log('🎉 [CONTEXT] Wallet connection completed successfully');
    } catch (error) {
      console.error('❌ [CONTEXT] Failed to connect wallet:', error);
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      connectToWallet();
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleChainChanged = () => {
    // Reload the page on chain change
    window.location.reload();
  };

  const disconnect = () => {
    setAccount('');
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUserRoles({
      isAdmin: false,
      isProcessor: false,
      isDistributor: false,
      isRetailer: false,
      hasAnyRole: false
    });
    setIsConnected(false);
    toast.info('Wallet disconnected');
  };

  const value = {
    // State
    account,
    provider,
    signer,
    contract,
    userRoles,
    isConnected,
    isLoading,
    
    // Functions
    connectToWallet,
    disconnect,
    loadUserRoles
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
