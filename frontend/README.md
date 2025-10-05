# FROST-CHAIN Frontend DApp

A React-based decentralized application (DApp) for the FROST-CHAIN blockchain-based frozen food supply chain traceability system.

## Features

- **Wallet Integration**: Connect with MetaMask for secure blockchain interaction
- **Role-Based Access**: Different interfaces for Processors, Distributors, Retailers, and Administrators  
- **Batch Management**: Create, track, and transfer ownership of product batches
- **Temperature Monitoring**: Real-time temperature tracking and alerts
- **Complete Traceability**: Full audit trail of all batch events and transfers
- **Admin Panel**: Role management and system overview for administrators

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [MetaMask](https://metamask.io/) browser extension
- A running Hardhat network with the Traceability contract deployed

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the contract:**
   
   Update `src/utils/config.js` with your deployed contract address:
   ```javascript
   export const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Usage

### First Time Setup

1. **Connect MetaMask**: Click "Connect Wallet" in the navigation bar
2. **Request Roles**: Contact an administrator to grant you appropriate roles
3. **Start Using**: Once roles are assigned, access the relevant features

### For Processors

- **Create Batches**: Initialize new product batches with details
- **Update Temperature**: Monitor and record temperature readings
- **Transfer Ownership**: Move batches to distributors

### For Distributors

- **Receive Batches**: Accept batches from processors
- **Monitor Temperature**: Continue temperature tracking
- **Transfer to Retailers**: Move batches down the supply chain

### For Retailers

- **Receive Final Products**: Accept batches for retail sale
- **View History**: Access complete traceability information
- **Update Status**: Mark products as sold or compromised

### For Administrators

- **Manage Roles**: Grant and revoke user permissions
- **System Overview**: Monitor all batches and activities
- **Emergency Actions**: Handle quality compromises and alerts

## User Interface

### Dashboard
- Overview of your batches and recent activities
- Quick access to common actions
- System status and statistics

### Batch Details
- Complete batch information and current status
- Temperature history and alerts
- Transfer and ownership history

### Batch History
- Chronological timeline of all batch events
- Event details with timestamps and actors
- Export capabilities for reporting

### Admin Panel
- Role management interface
- System-wide batch overview
- Administrative controls

## Smart Contract Integration

The frontend interacts with the Traceability smart contract through:

- **Web3 Provider**: MetaMask integration for transaction signing
- **Contract Interface**: Direct smart contract method calls
- **Event Listening**: Real-time updates from blockchain events
- **Role Checking**: Dynamic UI based on user permissions

## Security Features

- **Role-Based Access Control**: UI elements shown based on user roles
- **Transaction Signing**: All blockchain interactions require user approval
- **Input Validation**: Client-side validation for all form inputs
- **Error Handling**: Comprehensive error messages and recovery

## Development

### File Structure
```
src/
├── components/          # React components
│   ├── Navigation.js    # Main navigation bar
│   ├── Dashboard.js     # Main dashboard
│   ├── CreateBatch.js   # Batch creation form
│   ├── BatchDetails.js  # Batch information display
│   ├── BatchHistory.js  # Event timeline
│   ├── AdminPanel.js    # Admin interface
│   └── LoadingSpinner.js # Loading component
├── utils/              # Utility functions
│   ├── BlockchainContext.js # React context for blockchain state
│   ├── blockchain.js   # Blockchain interaction functions
│   └── config.js       # Configuration constants
├── App.js              # Main application component
└── index.js           # Application entry point
```

### Adding New Features

1. Create new components in the `components/` directory
2. Add new routes in `App.js`
3. Update the navigation in `Navigation.js`
4. Add new blockchain functions in `utils/blockchain.js`

### Testing

Run the test suite:
```bash
npm test
```

### Building for Production

Create a production build:
```bash
npm run build
```

## Troubleshooting

### Common Issues

**MetaMask Not Detected**
- Ensure MetaMask extension is installed and enabled
- Refresh the page after installing MetaMask

**Transaction Failures**
- Check that you have enough ETH for gas fees
- Verify you have the required role for the action
- Ensure the contract address is correct

**Role Access Issues**
- Contact an administrator to verify your roles
- Check that your wallet address is correct
- Refresh the page to update role information

**Network Issues**
- Ensure MetaMask is connected to the correct network
- For development, use the local Hardhat network (Chain ID: 31337)

### Support

For technical support or questions:
1. Check the console for error messages
2. Verify contract deployment and address
3. Ensure all dependencies are installed correctly
4. Check that the Hardhat network is running

## License

This project is part of the FROST-CHAIN supply chain traceability system.
