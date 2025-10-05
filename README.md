# FROST-CHAIN: Production-Ready Blockchain Traceability System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018.2.0-61DAFB.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.18-363636.svg)](https://soliditylang.org/)

## 🎯 Overview

FROST-CHAIN is a comprehensive blockchain-based traceability system designed specifically for frozen food supply chains. It provides end-to-end transparency, temperature monitoring, and role-based access control to ensure food safety and regulatory compliance.

### ✨ Key Features

- **🔐 Role-Based Access Control**: Secure permissions using OpenZeppelin's AccessControl
- **🌡️ Temperature Monitoring**: Real-time temperature tracking with automatic compromise detection
- **📊 Event-Driven Architecture**: Complete audit trail through blockchain events
- **⚡ Gas Optimized**: Efficient storage patterns and minimal gas consumption
- **🔮 Oracle Ready**: Integration-ready for IoT sensors and external data feeds
- **🎨 Modern Web Interface**: Responsive React frontend with MetaMask integration
- **🛡️ Production Security**: Comprehensive testing and security best practices

## 🏗️ Architecture

### Smart Contract Layer
```
contracts/
├── Traceability.sol           # Main contract with supply chain logic
├── interfaces/                # Contract interfaces for extensibility
└── libraries/                 # Reusable utility libraries
```

### Frontend Layer
```
frontend/
├── src/
│   ├── components/           # React components
│   ├── utils/               # Blockchain interaction utilities
│   └── App.js              # Main application component
├── public/                  # Static assets
└── build/                  # Production build artifacts
```

### Testing & Deployment
```
test/                       # Comprehensive test suite
scripts/                   # Deployment and utility scripts
hardhat.config.js         # Hardhat configuration
```

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

The easiest way to run FROST-CHAIN is using Docker:

1. **Prerequisites:**
   - Docker Desktop installed and running
   - At least 4GB available RAM

2. **Deploy with one command:**
   ```bash
   # Windows
   deploy.bat
   
   # Linux/Mac
   ./deploy.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Blockchain RPC: http://localhost:8545

4. **Configure MetaMask:**
   - Network Name: FROST-CHAIN Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

📖 **For detailed Docker instructions, see [DOCKER.md](DOCKER.md)**

### Option 2: Manual Development Setup

For development or if you prefer manual setup:

#### Prerequisites

- Node.js v16+ (v22.14.0 used in development)
- npm or yarn package manager
- MetaMask browser extension (for frontend interaction)

#### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Frost-chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development Workflow

1. **Compile smart contracts**
   ```bash
   npx hardhat compile
   ```

2. **Run comprehensive tests**
   ```bash
   npx hardhat test
   ```

3. **Deploy to local network**
   ```bash
   npx hardhat node          # Terminal 1
   npx hardhat run scripts/deploy.js --network localhost  # Terminal 2
   ```

4. **Start frontend development server**
   ```bash
   cd frontend
   npm start
   ```

5. **Build for production**
   ```bash
   cd frontend
   npm run build
   ```

## 📋 Smart Contract API

### Core Functions

#### Batch Management
```solidity
function createBatch(string memory productName, string memory additionalDetails) external
function getBatchInfo(uint256 batchId) external view returns (BatchInfo memory)
function getBatchCount() external view returns (uint256)
```

#### Traceability
```solidity
function addTraceEvent(uint256 batchId, string memory location, int16 temperature, string memory additionalNotes) external
function transferOwnership(uint256 batchId, address newOwner, uint8 newRole) external
```

#### Oracle Integration
```solidity
function addOracleReading(uint256 batchId, string memory location, int16 temperature, string memory notes) external
function addBatchOracleReadings(uint256[] memory batchIds, string[] memory locations, int16[] memory temperatures, string[] memory notes) external
```

#### Admin Functions
```solidity
function emergencyCompromise(uint256 batchId, string memory reason) external
function grantRole(bytes32 role, address account) external
function revokeRole(bytes32 role, address account) external
```

### Events

```solidity
event BatchEventLog(
    uint256 indexed batchId,
    address indexed actor,
    uint256 timestamp,
    string eventType,
    string details,
    int16 temperature
);
```

### Roles

- **DEFAULT_ADMIN_ROLE**: System administration and role management
- **PROCESSOR_ROLE**: Can create batches and add trace events
- **DISTRIBUTOR_ROLE**: Can receive and transfer batches
- **RETAILER_ROLE**: Final destination in supply chain
- **ORACLE_ROLE**: Automated data feeds and IoT integration

## 🎨 Frontend Components

### Core Components

1. **Dashboard**: Overview of batches and system statistics
2. **CreateBatch**: Form for creating new batches (Processor only)
3. **BatchDetails**: Detailed view of individual batches
4. **BatchHistory**: Complete audit trail visualization
5. **AdminPanel**: Role management and system administration

### Features

- **MetaMask Integration**: Seamless wallet connection
- **Role-Based UI**: Dynamic interface based on user permissions
- **Real-time Updates**: Live blockchain state synchronization
- **Responsive Design**: Mobile-friendly Bootstrap interface
- **Error Handling**: Comprehensive error states and notifications

## 🧪 Testing

### Test Coverage

- ✅ **Deployment Tests**: Contract deployment and initialization
- ✅ **Access Control**: Role-based permissions and security
- ✅ **Event Emissions**: Event-driven architecture validation
- ✅ **Business Logic**: Supply chain workflows and edge cases
- ✅ **Oracle Integration**: External data feed functionality
- ✅ **Gas Optimization**: Performance and cost analysis

### Running Tests

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test suites
npx hardhat test --grep "Access Control"
```

### Test Results

```
38 passing (2s)
- Gas used for createBatch: 120,142
- Gas used for addTraceEvent: 33,541
```

## 🚀 Deployment

### Local Development

```bash
# Start local blockchain
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment (Sepolia)

```bash
# Set environment variables
export SEPOLIA_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
export PRIVATE_KEY="your-private-key"
export ETHERSCAN_API_KEY="your-etherscan-api-key"

# Deploy and verify
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat verify DEPLOYED_CONTRACT_ADDRESS --network sepolia
```

### Mainnet Deployment

⚠️ **Security Checklist Before Mainnet:**
- [ ] Complete security audit
- [ ] Multi-signature wallet setup
- [ ] Emergency pause mechanism
- [ ] Gas price optimization
- [ ] Contract verification

## 🔧 Configuration

### Environment Variables

```env
# Blockchain Network URLs
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY

# Private Keys (Never commit to version control)
PRIVATE_KEY=your-deployment-private-key

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

# Frontend Configuration
REACT_APP_CONTRACT_ADDRESS=deployed-contract-address
REACT_APP_NETWORK_ID=1337
```

### Hardhat Configuration

```javascript
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
```

## 📊 Gas Optimization

### Storage Optimization

- **Struct Packing**: Optimized data structures for minimal storage slots
- **Event-Driven Architecture**: Off-chain data storage via events
- **Efficient Mappings**: Strategic use of mappings vs arrays

### Gas Usage Analysis

| Function | Gas Used | Optimization Notes |
|----------|----------|-------------------|
| createBatch | 120,142 | Optimized struct packing |
| addTraceEvent | 33,541 | Event emission pattern |
| transferOwnership | ~45,000 | Role validation efficient |

## 🛡️ Security

### Security Features

1. **Access Control**: OpenZeppelin's battle-tested AccessControl
2. **Input Validation**: Comprehensive parameter checking
3. **Reentrancy Protection**: Safe external calls
4. **Integer Overflow Protection**: Solidity 0.8+ built-in protection
5. **Emergency Controls**: Admin emergency functions

### Security Best Practices

- ✅ Principle of least privilege
- ✅ Role-based access control
- ✅ Input sanitization
- ✅ Event logging for audit trails
- ✅ Comprehensive test coverage
- ✅ Static analysis ready

### Known Considerations

- **Oracle Dependency**: External data feeds require trust assumptions
- **Admin Keys**: Centralized admin role needs secure key management
- **Gas Costs**: Transaction costs may affect adoption

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Follow Solidity style guide
- Maintain test coverage above 95%
- Document all public functions
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Security-focused smart contract libraries
- **Hardhat**: Ethereum development environment
- **React**: Frontend framework
- **Ethers.js**: Ethereum library for JavaScript
- **Bootstrap**: UI component framework

## 📞 Support

For support, please:
1. Check the [documentation](docs/)
2. Search [existing issues](issues)
3. Create a [new issue](issues/new) if needed

---

**Built with ❄️ for the frozen food industry by the FROST-CHAIN team**
