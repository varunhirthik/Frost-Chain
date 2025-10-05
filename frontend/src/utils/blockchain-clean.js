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

export const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
};

export const getStatusText = (status) => {
  const statusMap = {
    0: 'Created',
    1: 'In Transit', 
    2: 'Delivered',
    3: 'Compromised'
  };
  return statusMap[status] || 'Unknown';
};

export const getStatusBadgeClass = (status, isCompromised) => {
  if (isCompromised) return 'danger';
  
  const classMap = {
    0: 'primary',    // Created
    1: 'warning',    // In Transit
    2: 'success',    // Delivered
    3: 'danger'      // Compromised
  };
  return classMap[status] || 'secondary';
};

// Placeholder functions for dashboard
export const getAllBatches = async (contract) => {
  console.log('📦 [BATCHES] Getting all batches from blockchain...');
  
  try {
    if (!contract) {
      throw new Error('Contract not available');
    }

    // Get all BatchEventLog events from the contract
    console.log('🔍 [BATCHES] Querying BatchEventLog events...');
    const filter = contract.filters.BatchEventLog();
    const events = await contract.queryFilter(filter);
    
    console.log(`📋 [BATCHES] Found ${events.length} events`);

    // Group events by batch ID to build batch objects
    const batchesMap = new Map();
    
    for (const event of events) {
      const args = event.args;
      const batchId = args.batchId.toString();
      
      if (!batchesMap.has(batchId)) {
        batchesMap.set(batchId, {
          id: batchId,
          events: [],
          latestEvent: null
        });
      }
      
      const eventData = {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: args.timestamp.toString(),
        actor: args.actor,
        eventType: args.eventType,
        details: args.details,
        temperature: args.temperature.toString()
      };
      
      batchesMap.get(batchId).events.push(eventData);
    }

    // Convert to array and get latest state for each batch
    const batches = [];
    for (const [batchId, batchData] of batchesMap) {
      // Sort events by timestamp to find the latest
      batchData.events.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
      batchData.latestEvent = batchData.events[0];
      
      // Get current batch state from contract
      try {
        const batchState = await contract.batches(batchId);
        batches.push({
          id: batchId,
          batchId: batchState.batchId.toString(),
          creationTimestamp: batchState.creationTimestamp.toString(),
          processor: batchState.processor,
          isCompromised: batchState.isCompromised,
          status: batchState.status,
          currentOwner: batchState.currentOwner,
          events: batchData.events,
          latestEvent: batchData.latestEvent
        });
      } catch (error) {
        console.warn(`⚠️ [BATCHES] Could not get state for batch ${batchId}:`, error);
      }
    }

    console.log(`✅ [BATCHES] Retrieved ${batches.length} batches`);
    return batches;

  } catch (error) {
    console.error('❌ [BATCHES] Error getting batches:', error);
    throw new Error(`Failed to get batches: ${error.message}`);
  }
};

export const getBatchInfo = async () => {
  console.log('📋 [BATCH] Getting batch info (placeholder)');
  return {};
};

// Placeholder functions for other components
export const createBatch = async (contract, productName, additionalDetails) => {
  console.log('🏭 [CREATE] Creating batch on blockchain...');
  console.log('📦 [CREATE] Product:', productName);
  console.log('📝 [CREATE] Details:', additionalDetails);
  
  try {
    if (!contract) {
      throw new Error('Contract not available');
    }

    if (!productName || !productName.trim()) {
      throw new Error('Product name is required');
    }

    // Call the smart contract's createBatch function
    console.log('⏳ [CREATE] Calling contract.createBatch...');
    const tx = await contract.createBatch(
      productName.trim(),
      additionalDetails || ''
    );

    console.log('📤 [CREATE] Transaction sent:', tx.hash);
    console.log('⏳ [CREATE] Waiting for confirmation...');
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('✅ [CREATE] Transaction confirmed:', receipt.transactionHash);

    // Extract batch ID from the event logs
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'BatchEventLog';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = contract.interface.parseLog(event);
      const batchId = parsed.args.batchId.toString();
      
      console.log('🎉 [CREATE] Batch created successfully!');
      console.log('🆔 [CREATE] Batch ID:', batchId);
      
      return {
        success: true,
        batchId: batchId,
        transactionHash: receipt.transactionHash
      };
    } else {
      console.log('⚠️ [CREATE] Batch created but could not extract ID');
      return {
        success: true,
        batchId: 'unknown',
        transactionHash: receipt.transactionHash
      };
    }

  } catch (error) {
    console.error('❌ [CREATE] Error creating batch:', error);
    
    // Handle specific error types
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected by user');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for transaction');
    } else if (error.message.includes('PROCESSOR_ROLE')) {
      throw new Error('Only processors can create batches');
    } else {
      throw new Error(error.message || 'Failed to create batch');
    }
  }
};

export const getBatchHistory = async () => {
  console.log('📚 [HISTORY] Get batch history (placeholder)');
  return [];
};

export const getBatchDetails = async () => {
  console.log('📋 [DETAILS] Get batch details (placeholder)');
  return {};
};

export const updateTemperature = async () => {
  console.log('🌡️ [TEMP] Update temperature (placeholder)');
  throw new Error('Update temperature not implemented yet');
};

export const grantRole = async () => {
  console.log('👑 [ROLE] Grant role (placeholder)');
  throw new Error('Grant role not implemented yet');
};

export const revokeRole = async () => {
  console.log('🚫 [ROLE] Revoke role (placeholder)');
  throw new Error('Revoke role not implemented yet');
};

console.log('✅ [BLOCKCHAIN] Clean blockchain module loaded successfully');
