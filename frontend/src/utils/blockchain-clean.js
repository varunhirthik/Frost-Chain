// frontend/src/utils/blockchain.js
import { ethers } from 'ethers';
import { CONTRACT_ABI as COMPLETE_ABI } from './config.js';

console.log('🔧 [BLOCKCHAIN] Loading clean blockchain module...');

// Contract configuration
export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Use complete ABI from config.js for full functionality
export const CONTRACT_ABI = COMPLETE_ABI;

// Role constants
export const ROLES = {
  ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  PROCESSOR_ROLE: ethers.id("PROCESSOR_ROLE"),
  DISTRIBUTOR_ROLE: ethers.id("DISTRIBUTOR_ROLE"),
  RETAILER_ROLE: ethers.id("RETAILER_ROLE"),
  ORACLE_ROLE: ethers.id("ORACLE_ROLE")
};

// Provider and contract instance
let provider;
let contract;

/**
 * Initialize blockchain connection
 */
export const initializeProvider = async () => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found');
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    console.log('✅ [PROVIDER] Blockchain provider initialized');
    return { provider, contract };
  } catch (error) {
    console.error('❌ [PROVIDER] Failed to initialize provider:', error);
    throw error;
  }
};

/**
 * Get provider instance
 */
export const getProvider = () => provider;

/**
 * Get contract instance
 */
export const getContract = () => contract;

/**
 * Format Ethereum address for display
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Connect to MetaMask wallet
 */
export const connectWallet = async () => {
  console.log('🔗 [BLOCKCHAIN] Starting wallet connection...');
  
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    
    console.log('✅ [BLOCKCHAIN] MetaMask detected');
    
    // Request account access
    console.log('📝 [BLOCKCHAIN] Requesting account access...');
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    console.log('✅ [BLOCKCHAIN] Account access granted');
    
    // Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🌐 [BLOCKCHAIN] Current network chain ID:', chainId);
    console.log('🎯 [BLOCKCHAIN] Expected chain ID: 0x7a69 (31337)');
    
    if (chainId !== '0x7a69') {
      console.warn('⚠️ [BLOCKCHAIN] Wrong network! Please switch to Localhost 8545');
    }
    
    // Create provider and signer
    console.log('🔧 [BLOCKCHAIN] Creating provider and signer...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    
    console.log('✅ [BLOCKCHAIN] Wallet connected successfully');
    console.log('👤 [BLOCKCHAIN] Account:', account);
    
    return {
      provider,
      signer,
      account,
      chainId: parseInt(chainId, 16)
    };
    
  } catch (error) {
    console.error('❌ [BLOCKCHAIN] Error connecting wallet:', error);
    throw error;
  }
};

/**
 * Create contract instance
 */
export const createContract = (provider, signer = null) => {
  console.log('📄 [CONTRACT] Creating contract instance...');
  console.log('📍 [CONTRACT] Contract address:', CONTRACT_ADDRESS);
  
  try {
    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS, 
      CONTRACT_ABI, 
      signer || provider
    );
    
    console.log('✅ [CONTRACT] Contract instance created successfully');
    return contractInstance;
  } catch (error) {
    console.error('❌ [CONTRACT] Error creating contract:', error);
    throw error;
  }
};

/**
 * Create a new batch on the blockchain
 */
export const createBatch = async (contract, productName, details) => {
  console.log('🏭 [CREATE] Creating batch on blockchain...');
  console.log('📦 [CREATE] Product:', productName);
  console.log('📝 [CREATE] Details:', details);
  
  try {
    if (!contract) {
      throw new Error('Contract instance required');
    }
    
    if (!productName || !details) {
      throw new Error('Product name and details are required');
    }
    
    console.log('⏳ [CREATE] Calling contract.createBatch...');
    const tx = await contract.createBatch(productName, details);
    
    console.log('📝 [CREATE] Transaction sent:', tx.hash);
    console.log('⏳ [CREATE] Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ [CREATE] Transaction confirmed in block:', receipt.blockNumber);
    
    // Get the batch ID from the events
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'BatchEventLog';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsedEvent = contract.interface.parseLog(event);
      const batchId = parsedEvent.args.batchId.toString();
      console.log('🆔 [CREATE] New batch ID:', batchId);
      
      return {
        success: true,
        batchId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } else {
      console.warn('⚠️ [CREATE] Batch created but no event found');
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    }
    
  } catch (error) {
    console.error('❌ [CREATE] Error creating batch:', error);
    throw new Error(`Failed to create batch: ${error.message}`);
  }
};

/**
 * Get all batches from the blockchain
 */
export const getAllBatches = async (contract) => {
  console.log('📦 [BATCHES] Getting all batches from blockchain...');
  
  try {
    if (!contract) {
      throw new Error('Contract instance required');
    }
    
    // Query all BatchEventLog events to get batch IDs
    console.log('🔍 [BATCHES] Querying BatchEventLog events...');
    const events = await contract.queryFilter('BatchEventLog');
    
    console.log('📋 [BATCHES] Found', events.length, 'events');
    
    // Extract unique batch IDs
    const batchIds = [...new Set(events.map(event => event.args.batchId.toString()))];
    
    // Get detailed info for each batch
    const batches = [];
    for (const batchId of batchIds) {
      try {
        const batchInfo = await contract.getBatchInfo(batchId);
        
        const batchData = {
          batchId: batchInfo.batchId.toString(),
          creationTimestamp: Number(batchInfo.creationTimestamp),
          processor: batchInfo.processor,
          isCompromised: batchInfo.isCompromised,
          status: Number(batchInfo.status),
          currentOwner: batchInfo.currentOwner,
          
          // Get events for this batch
          events: events
            .filter(e => e.args.batchId.toString() === batchId)
            .map(e => ({
              eventType: e.args.eventType,
              details: e.args.details,
              temperature: Number(e.args.temperature),
              timestamp: Number(e.args.timestamp),
              actor: e.args.actor
            }))
            .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
        };
        
        // Add latest event info
        if (batchData.events.length > 0) {
          batchData.latestEvent = batchData.events[0];
        }
        
        batches.push(batchData);
      } catch (error) {
        console.warn(`⚠️ [BATCHES] Error getting info for batch ${batchId}:`, error);
      }
    }
    
    console.log('✅ [BATCHES] Retrieved', batches.length, 'batches');
    return batches;
    
  } catch (error) {
    console.error('❌ [BATCHES] Error getting batches:', error);
    throw new Error(`Failed to get batches: ${error.message}`);
  }
};

/**
 * Get user roles for the connected account
 */
export const getUserRoles = async (contract, account) => {
  console.log('👥 [ROLES] Simplified role check - all users have access');
  console.log('👤 [ROLES] Account:', account);
  
  // In simplified mode, all users have all permissions for testing
  const roles = {
    isAdmin: true,
    isProcessor: true,
    isDistributor: true,
    isRetailer: true
  };
  
  console.log('✅ [ROLES] Simplified roles (UI controls permissions):');
  console.log('   👑 Admin:', roles.isAdmin);
  console.log('   🏭 Processor:', roles.isProcessor);
  console.log('   🚚 Distributor:', roles.isDistributor);
  console.log('   🏪 Retailer:', roles.isRetailer);
  
  return roles;
};

/**
 * Switch network to Hardhat local
 */
export const switchToHardhat = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x7a69' }], // 31337 in hex
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x7a69',
              chainName: 'Hardhat Local',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              }
            }
          ]
        });
      } catch (addError) {
        throw new Error('Failed to add Hardhat network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
};

/**
 * Check if contract has getBatchInfo method
 */
export const checkContractMethods = (contract) => {
  console.log('🔍 [DEBUG] Available contract methods:');
  console.log('   - createBatch:', typeof contract.createBatch === 'function');
  console.log('   - getBatchInfo:', typeof contract.getBatchInfo === 'function');
  console.log('   - batches:', typeof contract.batches === 'function');
  console.log('   - hasRole:', typeof contract.hasRole === 'function');
  
  return {
    hasCreateBatch: typeof contract.createBatch === 'function',
    hasGetBatchInfo: typeof contract.getBatchInfo === 'function',
    hasBatches: typeof contract.batches === 'function',
    hasHasRole: typeof contract.hasRole === 'function'
  };
};

// Placeholder functions (to be implemented)
export const getBatchHistory = async () => {
  console.log('📚 [HISTORY] Get batch history (placeholder)');
  return [];
};

export const getBatchDetails = async (contract, batchId) => {
  console.log('📋 [DETAILS] Getting batch details for batch ID:', batchId);
  
  if (!contract || batchId === undefined || batchId === null) {
    throw new Error('Contract and batch ID are required');
  }

  try {
    // Debug: Check if method exists
    const methods = checkContractMethods(contract);
    if (!methods.hasGetBatchInfo) {
      throw new Error('getBatchInfo method not available on contract');
    }
    
    // Get basic batch info
    const batchInfo = await contract.getBatchInfo(batchId);
    console.log('📋 [DETAILS] Raw batch info:', batchInfo);
    
    // Check if batch exists (batchId should be > 0 for existing batches)
    if (!batchInfo || batchInfo.batchId.toString() === '0') {
      throw new Error('Batch not found');
    }
    
    // Parse the batch data
    const batch = {
      batchId: batchInfo.batchId.toString(),
      creationTimestamp: Number(batchInfo.creationTimestamp),
      processor: batchInfo.processor,
      isCompromised: batchInfo.isCompromised,
      status: Number(batchInfo.status),
      currentOwner: batchInfo.currentOwner,
      
      // Add formatted dates
      creationDate: new Date(Number(batchInfo.creationTimestamp) * 1000),
      
      // Add status labels
      statusLabel: ['Processing', 'InTransit', 'Delivered', 'Compromised'][Number(batchInfo.status)] || 'Unknown'
    };

    console.log('✅ [DETAILS] Processed batch details:', batch);
    return batch;
    
  } catch (error) {
    console.error('❌ [DETAILS] Error getting batch details:', error);
    throw new Error(`Failed to get batch details: ${error.message}`);
  }
};

export const updateTemperature = async () => {
  console.log('🌡️ [TEMP] Update temperature (placeholder)');
  throw new Error('Update temperature not implemented yet');
};

export const grantRole = async (contract, roleKey, userAddress) => {
  console.log('👑 [ROLE] Granting role:', roleKey, 'to:', userAddress);
  
  if (!contract) {
    throw new Error('Contract instance is required');
  }
  
  if (!userAddress || userAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Valid user address is required');
  }
  
  try {
    // First check if current user has admin role
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const currentAccount = await signer.getAddress();
    
    const hasAdminRole = await contract.hasRole(ROLES.ADMIN_ROLE, currentAccount);
    console.log('👑 [ROLE] Current account has admin role:', hasAdminRole);
    
    if (!hasAdminRole) {
      throw new Error(`Current account (${currentAccount}) does not have admin privileges. Please connect with the deployer account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`);
    }
    
    // Convert role key to proper role hash
    let roleHash;
    switch (roleKey) {
      case 'ADMIN_ROLE':
        roleHash = ROLES.ADMIN_ROLE;
        break;
      case 'PROCESSOR_ROLE':
        roleHash = ROLES.PROCESSOR_ROLE;
        break;
      case 'DISTRIBUTOR_ROLE':
        roleHash = ROLES.DISTRIBUTOR_ROLE;
        break;
      case 'RETAILER_ROLE':
        roleHash = ROLES.RETAILER_ROLE;
        break;
      case 'ORACLE_ROLE':
        roleHash = ROLES.ORACLE_ROLE;
        break;
      default:
        throw new Error('Invalid role key: ' + roleKey);
    }
    
    console.log('👑 [ROLE] Role hash:', roleHash);
    
    // Check if user already has the role
    const hasRole = await contract.hasRole(roleHash, userAddress);
    if (hasRole) {
      throw new Error('User already has this role');
    }
    
    // Grant the role
    const tx = await contract.grantRole(roleHash, userAddress);
    console.log('👑 [ROLE] Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ [ROLE] Role granted successfully. Gas used:', receipt.gasUsed.toString());
    
    return {
      success: true,
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('❌ [ROLE] Failed to grant role:', error);
    throw new Error('Failed to grant role: ' + error.message);
  }
};

export const revokeRole = async (contract, roleKey, userAddress) => {
  console.log('🚫 [ROLE] Revoking role:', roleKey, 'from:', userAddress);
  
  if (!contract) {
    throw new Error('Contract instance is required');
  }
  
  if (!userAddress || userAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Valid user address is required');
  }
  
  try {
    // Convert role key to proper role hash
    let roleHash;
    switch (roleKey) {
      case 'ADMIN_ROLE':
        roleHash = ROLES.ADMIN_ROLE;
        break;
      case 'PROCESSOR_ROLE':
        roleHash = ROLES.PROCESSOR_ROLE;
        break;
      case 'DISTRIBUTOR_ROLE':
        roleHash = ROLES.DISTRIBUTOR_ROLE;
        break;
      case 'RETAILER_ROLE':
        roleHash = ROLES.RETAILER_ROLE;
        break;
      case 'ORACLE_ROLE':
        roleHash = ROLES.ORACLE_ROLE;
        break;
      default:
        throw new Error('Invalid role key: ' + roleKey);
    }
    
    console.log('🚫 [ROLE] Role hash:', roleHash);
    
    // Check if user has the role
    const hasRole = await contract.hasRole(roleHash, userAddress);
    if (!hasRole) {
      throw new Error('User does not have this role');
    }
    
    // Revoke the role
    const tx = await contract.revokeRole(roleHash, userAddress);
    console.log('🚫 [ROLE] Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ [ROLE] Role revoked successfully. Gas used:', receipt.gasUsed.toString());
    
    return {
      success: true,
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('❌ [ROLE] Failed to revoke role:', error);
    throw new Error('Failed to revoke role: ' + error.message);
  }
};

// Utility functions for Dashboard
export const getBatchInfo = async (contract, batchId) => {
  // This is the same as getBatchDetails but with a different name for compatibility
  return await getBatchDetails(contract, batchId);
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusText = (status) => {
  const statusMap = {
    0: 'Processing',
    1: 'In Transit', 
    2: 'Delivered',
    3: 'Compromised'
  };
  
  return statusMap[status] || 'Unknown';
};

export const getStatusBadgeClass = (status) => {
  const classMap = {
    0: 'warning',     // Processing - yellow
    1: 'info',        // In Transit - blue  
    2: 'success',     // Delivered - green
    3: 'danger'       // Compromised - red
  };
  
  return classMap[status] || 'secondary';
};

// Additional role management functions
export const checkUserRole = async (contract, roleKey, userAddress) => {
  console.log('🔍 [ROLE] Checking if user has role:', roleKey, 'for:', userAddress);
  
  if (!contract || !userAddress) {
    return false;
  }
  
  try {
    let roleHash;
    switch (roleKey) {
      case 'ADMIN_ROLE':
        roleHash = ROLES.ADMIN_ROLE;
        break;
      case 'PROCESSOR_ROLE':
        roleHash = ROLES.PROCESSOR_ROLE;
        break;
      case 'DISTRIBUTOR_ROLE':
        roleHash = ROLES.DISTRIBUTOR_ROLE;
        break;
      case 'RETAILER_ROLE':
        roleHash = ROLES.RETAILER_ROLE;
        break;
      case 'ORACLE_ROLE':
        roleHash = ROLES.ORACLE_ROLE;
        break;
      default:
        return false;
    }
    
    const hasRole = await contract.hasRole(roleHash, userAddress);
    console.log('🔍 [ROLE] User has role:', hasRole);
    return hasRole;
  } catch (error) {
    console.error('❌ [ROLE] Error checking role:', error);
    return false;
  }
};

export const getAllUserRoles = async (contract, userAddress) => {
  console.log('📋 [ROLE] Getting all roles for user:', userAddress);
  
  if (!contract || !userAddress) {
    return {
      isAdmin: false,
      isProcessor: false,
      isDistributor: false,
      isRetailer: false,
      isOracle: false,
      hasAnyRole: false
    };
  }
  
  try {
    const [isAdmin, isProcessor, isDistributor, isRetailer, isOracle] = await Promise.all([
      contract.hasRole(ROLES.ADMIN_ROLE, userAddress),
      contract.hasRole(ROLES.PROCESSOR_ROLE, userAddress),
      contract.hasRole(ROLES.DISTRIBUTOR_ROLE, userAddress),
      contract.hasRole(ROLES.RETAILER_ROLE, userAddress),
      contract.hasRole(ROLES.ORACLE_ROLE, userAddress)
    ]);
    
    const roles = {
      isAdmin,
      isProcessor,
      isDistributor,
      isRetailer,
      isOracle,
      hasAnyRole: isAdmin || isProcessor || isDistributor || isRetailer || isOracle
    };
    
    console.log('📋 [ROLE] User roles:', roles);
    return roles;
  } catch (error) {
    console.error('❌ [ROLE] Error getting user roles:', error);
    return {
      isAdmin: false,
      isProcessor: false,
      isDistributor: false,
      isRetailer: false,
      isOracle: false,
      hasAnyRole: false
    };
  }
};

export const getAdminInfo = async (contract) => {
  console.log('👑 [ADMIN] Getting admin account information...');
  
  if (!contract) {
    return { deployer: null, currentUserIsAdmin: false };
  }
  
  try {
    // Get current user
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const currentAccount = await signer.getAddress();
    
    // Check if current user is admin
    const currentUserIsAdmin = await contract.hasRole(ROLES.ADMIN_ROLE, currentAccount);
    
    // The deployer is typically the first admin (from deployment file)
    const deployerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    
    return {
      deployer: deployerAddress,
      currentUser: currentAccount,
      currentUserIsAdmin,
      deployerIsAdmin: await contract.hasRole(ROLES.ADMIN_ROLE, deployerAddress)
    };
  } catch (error) {
    console.error('❌ [ADMIN] Error getting admin info:', error);
    return { deployer: null, currentUserIsAdmin: false };
  }
};

export const grantMultipleRoles = async (contract, userAddress, roleKeys) => {
  console.log('👑 [ROLE] Granting multiple roles:', roleKeys, 'to:', userAddress);
  
  if (!contract || !userAddress || !Array.isArray(roleKeys)) {
    throw new Error('Contract, user address, and role keys array are required');
  }
  
  try {
    const results = [];
    
    for (const roleKey of roleKeys) {
      try {
        const result = await grantRole(contract, roleKey, userAddress);
        results.push({ roleKey, success: true, result });
      } catch (error) {
        results.push({ roleKey, success: false, error: error.message });
      }
    }
    
    console.log('👑 [ROLE] Multiple roles grant results:', results);
    return results;
  } catch (error) {
    console.error('❌ [ROLE] Error granting multiple roles:', error);
    throw error;
  }
};

console.log('✅ [BLOCKCHAIN] Clean blockchain module loaded successfully');
