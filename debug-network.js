// Debug script to help troubleshoot network and balance issues
// Run this in the browser console when on localhost:3000

async function debugNetworkAndBalance() {
  console.log('🔍 [DEBUG] Starting network and balance diagnosis...');
  
  // Check if MetaMask is available
  if (!window.ethereum) {
    console.error('❌ [DEBUG] MetaMask not found!');
    return;
  }
  
  try {
    // Get current network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🌐 [DEBUG] Current Chain ID:', chainId);
    console.log('🎯 [DEBUG] Expected Chain ID: 0x7a69 (31337 for Hardhat)');
    
    if (chainId !== '0x7a69') {
      console.warn('⚠️ [DEBUG] WRONG NETWORK! You need to switch to Hardhat Local Network');
      console.log('📋 [DEBUG] Network Settings:');
      console.log('   Network Name: Hardhat Local');
      console.log('   RPC URL: http://127.0.0.1:8545');
      console.log('   Chain ID: 31337');
      console.log('   Currency Symbol: ETH');
      return;
    }
    
    // Get accounts
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      console.error('❌ [DEBUG] No accounts connected!');
      return;
    }
    
    const account = accounts[0];
    console.log('👤 [DEBUG] Connected Account:', account);
    
    // Check balance
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [account, 'latest']
    });
    
    const balanceInEth = parseInt(balance, 16) / 1e18;
    console.log('💰 [DEBUG] Account Balance:', balanceInEth, 'ETH');
    
    if (balanceInEth < 0.1) {
      console.warn('⚠️ [DEBUG] Low balance! You might need more test ETH');
    }
    
    // Test contract connection
    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    console.log('📄 [DEBUG] Contract Address:', contractAddress);
    
    // Check if contract exists at address
    const code = await window.ethereum.request({
      method: 'eth_getCode',
      params: [contractAddress, 'latest']
    });
    
    if (code === '0x') {
      console.error('❌ [DEBUG] Contract not deployed at this address!');
      console.log('💡 [DEBUG] Try redeploying with: npx hardhat run scripts/deploy.js --network localhost');
    } else {
      console.log('✅ [DEBUG] Contract found at address');
    }
    
    console.log('✅ [DEBUG] Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ [DEBUG] Error during diagnosis:', error);
  }
}

// Run the diagnosis
debugNetworkAndBalance();
