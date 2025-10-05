// Minimal config for testing
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Minimal ABI - just the functions we need
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

// Debug logging
console.log('⚙️ [CONFIG] Minimal config loaded');
console.log('📍 [CONFIG] Contract Address:', CONTRACT_ADDRESS);
console.log('📋 [CONFIG] ABI functions:', CONTRACT_ABI.length);
