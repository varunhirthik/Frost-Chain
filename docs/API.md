# FROST-CHAIN API Documentation

## Smart Contract API Reference

### Contract Address
- **Local Development**: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (Hardhat Network)
- **Testnet**: TBD (Deploy to Sepolia)
- **Mainnet**: TBD (Production deployment)

## Core Functions

### Batch Management

#### `createBatch(string memory productName, string memory additionalDetails)`
Creates a new batch in the supply chain system.

**Access**: Requires `PROCESSOR_ROLE`

**Parameters**:
- `productName` (string): Name/type of the product being traced
- `additionalDetails` (string): Additional metadata about the batch

**Events Emitted**:
```solidity
BatchEventLog(batchId, msg.sender, block.timestamp, "CREATED", details, SAFE_TEMPERATURE_THRESHOLD)
```

**Gas Usage**: ~120,142 gas

**Example**:
```javascript
await contract.createBatch("Frozen Organic Blueberries", "Grade A, 500kg batch");
```

#### `getBatchInfo(uint256 batchId)`
Retrieves comprehensive information about a specific batch.

**Access**: Public (read-only)

**Parameters**:
- `batchId` (uint256): Unique identifier of the batch

**Returns**: `BatchInfo` struct containing:
```solidity
struct BatchInfo {
    uint256 batchId;
    address processor;
    address currentOwner;
    string productName;
    string additionalDetails;
    uint256 creationTimestamp;
    bool isCompromised;
    SupplyChainRole status;
}
```

**Example**:
```javascript
const batchInfo = await contract.getBatchInfo(1);
console.log(`Batch ${batchInfo.batchId} is owned by ${batchInfo.currentOwner}`);
```

#### `getBatchCount()`
Returns the total number of batches created.

**Access**: Public (read-only)

**Returns**: `uint256` - Total batch count

**Example**:
```javascript
const totalBatches = await contract.getBatchCount();
```

### Traceability Functions

#### `addTraceEvent(uint256 batchId, string memory location, int16 temperature, string memory additionalNotes)`
Adds a trace event to a batch's history.

**Access**: Batch owner or oracle role

**Parameters**:
- `batchId` (uint256): Target batch identifier
- `location` (string): Location where event occurred
- `temperature` (int16): Temperature reading in Celsius
- `additionalNotes` (string): Additional event details

**Temperature Logic**:
- Temperature ≤ -18°C: Safe (UPDATE event)
- Temperature > -18°C: Compromised (COMPROMISED event)

**Events Emitted**:
```solidity
BatchEventLog(batchId, msg.sender, block.timestamp, eventType, details, temperature)
```

**Gas Usage**: ~33,541 gas

**Example**:
```javascript
await contract.addTraceEvent(1, "Warehouse A", -20, "Regular quality check");
```

#### `transferOwnership(uint256 batchId, address newOwner, uint8 newRole)`
Transfers batch ownership to next supply chain participant.

**Access**: Current batch owner

**Parameters**:
- `batchId` (uint256): Batch to transfer
- `newOwner` (address): Address of new owner
- `newRole` (uint8): New role (1=DISTRIBUTOR, 2=RETAILER)

**Validations**:
- Cannot transfer to zero address
- Cannot transfer to self
- New owner must have appropriate role

**Events Emitted**:
```solidity
BatchEventLog(batchId, msg.sender, block.timestamp, "HANDOVER", details, currentTemperature)
```

**Example**:
```javascript
await contract.transferOwnership(1, distributorAddress, 1); // Transfer to distributor
```

### Oracle Integration

#### `addOracleReading(uint256 batchId, string memory location, int16 temperature, string memory notes)`
Allows oracles to add automated readings without being batch owner.

**Access**: Requires `ORACLE_ROLE`

**Parameters**:
- `batchId` (uint256): Target batch
- `location` (string): Sensor/device location
- `temperature` (int16): Temperature reading
- `notes` (string): Automated notes

**Example**:
```javascript
await contract.connect(oracle).addOracleReading(1, "IoT Sensor #1234", -19, "Automated hourly reading");
```

#### `addBatchOracleReadings(uint256[] memory batchIds, string[] memory locations, int16[] memory temperatures, string[] memory notes)`
Batch process multiple oracle readings in a single transaction.

**Access**: Requires `ORACLE_ROLE`

**Parameters**:
- `batchIds` (uint256[]): Array of batch identifiers
- `locations` (string[]): Array of locations
- `temperatures` (int16[]): Array of temperature readings
- `notes` (string[]): Array of notes

**Validations**:
- All arrays must have same length
- Minimum one reading required

**Example**:
```javascript
await contract.connect(oracle).addBatchOracleReadings(
  [1, 2, 3],
  ["Sensor A", "Sensor B", "Sensor C"],
  [-20, -19, -21],
  ["Reading 1", "Reading 2", "Reading 3"]
);
```

### Administrative Functions

#### `emergencyCompromise(uint256 batchId, string memory reason)`
Admin function to mark a batch as compromised in emergency situations.

**Access**: Requires `DEFAULT_ADMIN_ROLE`

**Parameters**:
- `batchId` (uint256): Batch to compromise
- `reason` (string): Reason for emergency action

**Example**:
```javascript
await contract.emergencyCompromise(1, "Regulatory recall - safety concern");
```

#### `grantRole(bytes32 role, address account)`
Grants a specific role to an account.

**Access**: Requires `DEFAULT_ADMIN_ROLE`

**Parameters**:
- `role` (bytes32): Role identifier
- `account` (address): Account to grant role to

**Available Roles**:
```javascript
const PROCESSOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROCESSOR_ROLE"));
const DISTRIBUTOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DISTRIBUTOR_ROLE"));
const RETAILER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RETAILER_ROLE"));
const ORACLE_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE"));
```

**Example**:
```javascript
await contract.grantRole(PROCESSOR_ROLE, processorAddress);
```

#### `revokeRole(bytes32 role, address account)`
Revokes a role from an account.

**Access**: Requires `DEFAULT_ADMIN_ROLE`

**Example**:
```javascript
await contract.revokeRole(PROCESSOR_ROLE, oldProcessorAddress);
```

### Utility Functions

#### `hasSupplyChainRole(address account)`
Checks if an account has any supply chain role.

**Access**: Public (read-only)

**Returns**: `bool` - True if account has any role

**Example**:
```javascript
const hasRole = await contract.hasSupplyChainRole(userAddress);
```

#### `hasRole(bytes32 role, address account)`
Checks if an account has a specific role.

**Access**: Public (read-only)

**Returns**: `bool` - True if account has the role

**Example**:
```javascript
const isProcessor = await contract.hasRole(PROCESSOR_ROLE, userAddress);
```

## Events

### `BatchEventLog`

The primary event for tracking all batch activities.

```solidity
event BatchEventLog(
    uint256 indexed batchId,    // Batch identifier
    address indexed actor,      // Account performing action
    uint256 timestamp,          // Block timestamp
    string eventType,           // Type of event
    string details,             // Event details
    int16 temperature          // Temperature at time of event
);
```

**Event Types**:
- `"CREATED"`: Batch creation
- `"UPDATE"`: Safe temperature reading
- `"COMPROMISED"`: Unsafe temperature detected
- `"HANDOVER"`: Ownership transfer
- `"EMERGENCY"`: Admin emergency action

**Filtering Events**:
```javascript
// Get all events for a specific batch
const filter = contract.filters.BatchEventLog(batchId);
const events = await contract.queryFilter(filter);

// Get all events by a specific actor
const actorFilter = contract.filters.BatchEventLog(null, actorAddress);
const actorEvents = await contract.queryFilter(actorFilter);
```

## Data Structures

### `BatchInfo` Struct
```solidity
struct BatchInfo {
    uint256 batchId;           // Unique batch identifier
    address processor;         // Original processor address
    address currentOwner;      // Current owner address
    string productName;        // Product name/type
    string additionalDetails;  // Additional metadata
    uint256 creationTimestamp; // Creation time
    bool isCompromised;        // Compromise status
    SupplyChainRole status;    // Current supply chain status
}
```

### `SupplyChainRole` Enum
```solidity
enum SupplyChainRole {
    CREATED,      // 0: Just created
    PROCESSOR,    // 1: At processor
    DISTRIBUTOR,  // 2: At distributor
    RETAILER      // 3: At retailer
}
```

## Error Handling

### Common Errors

#### Access Control Errors
```
Error: AccessControl: account 0x... is missing role 0x...
```
**Solution**: Ensure the account has the required role before calling the function.

#### Invalid Batch Errors
```
Error: Batch does not exist
```
**Solution**: Verify the batch ID exists using `getBatchCount()`.

#### Transfer Validation Errors
```
Error: Cannot transfer to zero address
Error: Cannot transfer to self
```
**Solution**: Provide a valid, different address for transfers.

#### Array Length Mismatch
```
Error: Array lengths must match
```
**Solution**: Ensure all arrays in batch operations have the same length.

## Frontend Integration

### Contract Instance Setup
```javascript
import { ethers } from 'ethers';
import contractABI from './contracts/Traceability.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
```

### Reading Data
```javascript
// Get batch information
const batchInfo = await contract.getBatchInfo(batchId);

// Check user roles
const isProcessor = await contract.hasRole(PROCESSOR_ROLE, userAddress);

// Get total batches
const batchCount = await contract.getBatchCount();
```

### Writing Data
```javascript
// Create batch (requires PROCESSOR_ROLE)
const tx = await contract.createBatch("Product Name", "Details");
await tx.wait(); // Wait for transaction confirmation

// Add trace event
const traceTx = await contract.addTraceEvent(batchId, "Location", -20, "Notes");
await traceTx.wait();

// Transfer ownership
const transferTx = await contract.transferOwnership(batchId, newOwnerAddress, 1);
await transferTx.wait();
```

### Event Listening
```javascript
// Listen for new batch events
contract.on("BatchEventLog", (batchId, actor, timestamp, eventType, details, temperature) => {
    console.log(`New event for batch ${batchId}: ${eventType}`);
});

// Get historical events
const filter = contract.filters.BatchEventLog();
const events = await contract.queryFilter(filter, fromBlock, toBlock);
```

## Gas Optimization Tips

1. **Batch Operations**: Use `addBatchOracleReadings` for multiple readings
2. **Event Storage**: Store large data in events rather than contract storage
3. **Role Checking**: Cache role checks in frontend to avoid unnecessary calls
4. **Transaction Batching**: Group multiple operations when possible

## Rate Limits and Considerations

- **Block Confirmation Time**: ~12-15 seconds on Ethereum
- **Gas Price Fluctuation**: Monitor gas prices for optimal transaction timing
- **Event Query Limits**: Use block ranges to avoid timeout on large queries
- **MetaMask Limitations**: Handle user rejection and network switching gracefully

## Testing API

For testing purposes, the contract includes additional functions:

```javascript
// Reset contract state (test networks only)
await contract.resetForTesting(); // If implemented

// Mock oracle readings for development
await contract.addTestOracleReading(batchId, temperature);
```

## API Versioning

- **Current Version**: 2.0.0
- **Contract Version**: Immutable once deployed
- **Frontend Compatibility**: Backward compatible with ABI changes
- **Event Structure**: Stable across versions

---

*For additional support, please refer to the main README.md or create an issue in the project repository.*
