// Minimal config for testing
export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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
