// frontend/src/utils/blockchain.js
import { ethers } from 'ethers';

console.log('🔧 [BLOCKCHAIN] Loading clean blockchain module...');

// Contract configuration
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Minimal ABI for testing
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Role constants
export const ROLES = {
  ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  PROCESSOR_ROLE: ethers.id("PROCESSOR_ROLE"),
  DISTRIBUTOR_ROLE: ethers.id("DISTRIBUTOR_ROLE"),
  RETAILER_ROLE: ethers.id("RETAILER_ROLE")
};

// Connect to wallet
export const connectWallet = async () => {
  console.log('🔗 [BLOCKCHAIN] Starting wallet connection...');
  
  if (!window.ethereum) {
    console.error('❌ [BLOCKCHAIN] MetaMask not detected');
    throw new Error('MetaMask is not installed');
  }
  
  console.log('✅ [BLOCKCHAIN] MetaMask detected');

  try {
    console.log('📝 [BLOCKCHAIN] Requesting account access...');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('✅ [BLOCKCHAIN] Account access granted');
    
    // Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🌐 [BLOCKCHAIN] Current network chain ID:', chainId);
    console.log('🎯 [BLOCKCHAIN] Expected chain ID: 0x7a69 (31337)');
    
    if (chainId !== '0x7a69') {
      console.warn('⚠️ [BLOCKCHAIN] Wrong network! Please switch to Localhost 8545');
    }
    
    console.log('🔧 [BLOCKCHAIN] Creating provider and signer...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    
    console.log('✅ [BLOCKCHAIN] Wallet connected successfully');
    console.log('👤 [BLOCKCHAIN] Account:', account);

    return { provider, signer, account };
  } catch (error) {
    console.error('❌ [BLOCKCHAIN] Wallet connection failed:', error);
    if (error.code === 4001) {
      throw new Error('User denied wallet connection');
    }
    throw new Error('Failed to connect wallet: ' + error.message);
  }
};

// Get contract instance
export const getContract = (signer) => {
  console.log('📄 [CONTRACT] Creating contract instance...');
  console.log('📍 [CONTRACT] Contract address:', CONTRACT_ADDRESS);
  
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    console.log('✅ [CONTRACT] Contract instance created successfully');
    return contract;
  } catch (error) {
    console.error('❌ [CONTRACT] Failed to create contract instance:', error);
    throw error;
  }
};

// Get user roles (simplified for testing)
export const getUserRoles = async (contract, account) => {
  console.log('👥 [ROLES] Checking user roles...');
  console.log('👤 [ROLES] Account:', account);
  
  try {
    // For testing, assume deployer account is admin
    const isAdmin = account?.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
    
    const roles = {
      isAdmin,
      isProcessor: false,
      isDistributor: false,
      isRetailer: false,
      hasAnyRole: isAdmin
    };
    
    console.log('✅ [ROLES] Roles determined:');
    console.log('   👑 Admin:', roles.isAdmin);
    console.log('   🏭 Processor:', roles.isProcessor);
    console.log('   🚚 Distributor:', roles.isDistributor);
    console.log('   🏪 Retailer:', roles.isRetailer);

    return roles;
  } catch (error) {
    console.error('❌ [ROLES] Failed to check user roles:', error);
    return {
      isAdmin: false,
      isProcessor: false,
      isDistributor: false,
      isRetailer: false,
      hasAnyRole: false
    };
  }
};

// Utility functions
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Placeholder functions for dashboard
export const getAllBatches = async () => {
  console.log('📦 [BATCHES] Getting all batches (placeholder)');
  return [];
};

export const getBatchInfo = async () => {
  console.log('📋 [BATCH] Getting batch info (placeholder)');
  return {};
};

console.log('✅ [BLOCKCHAIN] Clean blockchain module loaded successfully');
