// Test import
try {
  console.log('Testing blockchain imports...');
  
  // Test config import first
  import('./utils/config.js').then(config => {
    console.log('✅ Config loaded:', !!config.CONTRACT_ADDRESS);
    console.log('Contract Address:', config.CONTRACT_ADDRESS);
    
    // Test blockchain import
    return import('./utils/blockchain.js');
  }).then(blockchain => {
    console.log('✅ Blockchain loaded');
    console.log('connectWallet function:', typeof blockchain.connectWallet);
    console.log('Available exports:', Object.keys(blockchain));
  }).catch(error => {
    console.error('❌ Import failed:', error);
  });
  
} catch (error) {
  console.error('❌ Test failed:', error);
}
