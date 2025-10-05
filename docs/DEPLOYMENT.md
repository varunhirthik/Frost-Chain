# FROST-CHAIN Deployment Guide

## Prerequisites

### System Requirements
- **Node.js**: v16+ (v22.14.0 recommended)
- **npm**: v8+ or yarn v1.22+
- **Git**: For version control
- **MetaMask**: Browser extension for wallet interaction

### Development Tools
- **Hardhat**: Ethereum development environment
- **VS Code**: Recommended IDE with Solidity extensions
- **Postman**: For API testing (optional)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd Frost-chain
```

### 2. Install Dependencies
```bash
# Root dependencies (Hardhat, testing tools)
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables
```env
# Blockchain Network URLs
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY

# Private Keys (NEVER commit these!)
PRIVATE_KEY=your-deployment-private-key

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

# Frontend Configuration
REACT_APP_CONTRACT_ADDRESS=deployed-contract-address
REACT_APP_NETWORK_ID=1337
```

## Development Deployment

### 1. Compile Smart Contracts
```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 2. Run Test Suite
```bash
npx hardhat test
```

Expected output:
```
  38 passing (2s)
```

### 3. Local Blockchain Setup
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Frontend Development Server
```bash
cd frontend
npm start
```

Access at: `http://localhost:3000`

## Testnet Deployment (Sepolia)

### 1. Setup Testnet Wallet
1. Create new MetaMask account for deployment
2. Get Sepolia ETH from faucet: https://sepoliafaucet.com/
3. Export private key (keep secure!)

### 2. Configure Network
Add to `hardhat.config.js`:
```javascript
sepolia: {
  url: process.env.SEPOLIA_URL,
  accounts: [process.env.PRIVATE_KEY],
  chainId: 11155111,
}
```

### 3. Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Verify Contract
```bash
npx hardhat verify DEPLOYED_CONTRACT_ADDRESS --network sepolia
```

### 5. Update Frontend Configuration
```bash
# Update frontend/.env
REACT_APP_CONTRACT_ADDRESS=your-deployed-address
REACT_APP_NETWORK_ID=11155111
```

## Production Deployment (Mainnet)

### ⚠️ Pre-Deployment Checklist

- [ ] Security audit completed
- [ ] Multi-signature wallet setup
- [ ] Emergency procedures documented
- [ ] Gas price strategy defined
- [ ] Monitoring tools configured
- [ ] Backup recovery plan ready

### 1. Security Preparations

#### Multi-Signature Wallet Setup
```bash
# Deploy with Gnosis Safe or similar
# Minimum 2/3 signature requirement
# Store recovery phrases securely
```

#### Contract Security Review
```bash
# Run security analysis
npm audit
npx hardhat check

# Static analysis (optional)
mythril analyze contracts/Traceability.sol
slither contracts/Traceability.sol
```

### 2. Mainnet Deployment

#### Configure Mainnet Network
```javascript
mainnet: {
  url: process.env.MAINNET_URL,
  accounts: [process.env.MAINNET_PRIVATE_KEY],
  chainId: 1,
  gasPrice: "auto", // Use network gas price
}
```

#### Deploy Contract
```bash
# Check gas prices first
npx hardhat run scripts/gas-check.js --network mainnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Verify on Etherscan
npx hardhat verify DEPLOYED_ADDRESS --network mainnet
```

### 3. Frontend Production Build

#### Build Optimization
```bash
cd frontend
npm run build
```

#### Deploy Frontend
```bash
# Static hosting (Netlify/Vercel/GitHub Pages)
# Upload build/ folder contents
# Configure domain and SSL
```

## Post-Deployment Configuration

### 1. Role Assignment

#### Admin Roles
```javascript
// Grant admin roles to multi-sig wallet
await contract.grantRole(DEFAULT_ADMIN_ROLE, multiSigAddress);

// Revoke deployer admin (if different from multi-sig)
await contract.revokeRole(DEFAULT_ADMIN_ROLE, deployerAddress);
```

#### Supply Chain Roles
```javascript
// Grant processor roles
await contract.grantRole(PROCESSOR_ROLE, processorAddress);

// Grant distributor roles
await contract.grantRole(DISTRIBUTOR_ROLE, distributorAddress);

// Grant retailer roles
await contract.grantRole(RETAILER_ROLE, retailerAddress);

// Grant oracle roles (for IoT integration)
await contract.grantRole(ORACLE_ROLE, oracleAddress);
```

### 2. System Verification

#### Contract Functionality Test
```javascript
// Test batch creation
await contract.createBatch("Test Product", "Test Details");

// Test role permissions
const hasRole = await contract.hasRole(PROCESSOR_ROLE, testAddress);

// Test emergency functions
await contract.emergencyCompromise(1, "Test emergency");
```

#### Frontend Integration Test
1. Connect MetaMask to deployed network
2. Test wallet connection
3. Verify role-based UI display
4. Test batch creation and management
5. Verify event listening and updates

## Monitoring & Maintenance

### 1. Contract Monitoring

#### Events Monitoring
```javascript
// Monitor all contract events
contract.on("BatchEventLog", (batchId, actor, timestamp, eventType) => {
  console.log(`Event: ${eventType} for batch ${batchId}`);
  // Send to monitoring system
});
```

#### Health Checks
```javascript
// Regular contract health checks
const batchCount = await contract.getBatchCount();
const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminAddress);
```

### 2. Performance Monitoring

#### Gas Usage Tracking
```bash
# Monitor gas prices
curl -X GET "https://api.etherscan.io/api?module=gastracker&action=gasoracle"

# Track transaction costs
npx hardhat run scripts/gas-analysis.js
```

#### Error Monitoring
```javascript
// Frontend error tracking
window.addEventListener('error', (error) => {
  // Send to error tracking service
  console.error('Frontend error:', error);
});

// Contract error handling
try {
  await contract.someFunction();
} catch (error) {
  // Log and handle contract errors
  console.error('Contract error:', error);
}
```

## Backup & Recovery

### 1. Contract Backup

#### Deployment Information
```json
{
  "contractAddress": "0x...",
  "deploymentTx": "0x...",
  "blockNumber": 123456,
  "deployerAddress": "0x...",
  "network": "mainnet",
  "timestamp": "2025-10-05T00:00:00Z"
}
```

#### Role Assignments Backup
```javascript
// Export all role assignments
const roles = {
  admin: await contract.getRoleMembers(DEFAULT_ADMIN_ROLE),
  processor: await contract.getRoleMembers(PROCESSOR_ROLE),
  distributor: await contract.getRoleMembers(DISTRIBUTOR_ROLE),
  retailer: await contract.getRoleMembers(RETAILER_ROLE),
  oracle: await contract.getRoleMembers(ORACLE_ROLE)
};
```

### 2. Data Backup

#### Event Data Export
```javascript
// Export all events for backup
const filter = contract.filters.BatchEventLog();
const events = await contract.queryFilter(filter, 0, 'latest');
// Store in IPFS or traditional database
```

#### Configuration Backup
```bash
# Backup all configuration files
tar -czf frost-chain-backup.tar.gz \
  contracts/ \
  scripts/ \
  hardhat.config.js \
  frontend/src/utils/blockchain.js \
  .env.example
```

## Troubleshooting

### Common Issues

#### 1. Deployment Failures
```bash
# Issue: Out of gas
# Solution: Increase gas limit in deployment script

# Issue: Nonce too low
# Solution: Reset MetaMask account or specify nonce

# Issue: Network connection
# Solution: Check RPC URL and API keys
```

#### 2. Frontend Issues
```bash
# Issue: MetaMask not connecting
# Solution: Check network configuration and reload page

# Issue: Contract calls failing
# Solution: Verify contract address and ABI

# Issue: Role permissions
# Solution: Check if user has required roles
```

### Diagnostic Commands

#### Contract State Check
```bash
npx hardhat console --network mainnet
> const contract = await ethers.getContractAt("Traceability", "CONTRACT_ADDRESS");
> await contract.getBatchCount();
```

#### Network Health Check
```bash
# Check Ethereum node health
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $MAINNET_URL
```

## Security Considerations

### 1. Key Management
- Use hardware wallets for mainnet deployments
- Implement multi-signature for admin functions
- Rotate keys regularly
- Store backups securely offline

### 2. Access Control
- Follow principle of least privilege
- Regular access reviews
- Audit role assignments
- Monitor admin actions

### 3. Emergency Procedures
- Document emergency contacts
- Prepare emergency pause procedures
- Test recovery scenarios
- Maintain incident response plan

## Support & Resources

### Documentation
- [README.md](../README.md) - Project overview
- [API.md](API.md) - Complete API reference
- [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md) - Technical implementation details

### External Resources
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [React Documentation](https://reactjs.org/docs)

### Community Support
- Create issues in project repository
- Join Ethereum development communities
- Consult smart contract security experts

---

**Deployment Guide Version**: 2.0.0  
**Last Updated**: October 5, 2025  
**Status**: Production Ready ✅
