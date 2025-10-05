// Test blockchain functions
import { ethers } from 'ethers';

console.log('🔧 [BLOCKCHAIN] Module loading...');

// Simple test function
export const connectWallet = async () => {
  console.log('🔗 [BLOCKCHAIN] Function called successfully!');
  console.log('🔗 [BLOCKCHAIN] connectWallet is working!');
  
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    
    console.log('✅ [BLOCKCHAIN] Connected:', account);
    
    return { provider, signer, account };
  } catch (error) {
    console.error('❌ [BLOCKCHAIN] Error:', error);
    throw error;
  }
};

export const getContract = (signer) => {
  console.log('📄 [CONTRACT] Creating test contract...');
  return { test: true, signer };
};

export const getUserRoles = async () => {
  console.log('👥 [ROLES] Getting test roles...');
  return {
    isAdmin: true,
    isProcessor: false,
    isDistributor: false,
    isRetailer: false,
    hasAnyRole: true
  };
};

console.log('✅ [BLOCKCHAIN] Module loaded successfully');
