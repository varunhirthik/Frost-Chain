# Role Management Guide for FROST-CHAIN

## Overview

FROST-CHAIN uses Role-Based Access Control (RBAC) to manage permissions in the supply chain. Only users with appropriate roles can perform specific actions.

## Available Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **DEFAULT_ADMIN_ROLE** | System administrator | Can grant/revoke all roles, emergency controls |
| **PROCESSOR_ROLE** | Food manufacturers | Can create batches, add temperature readings |
| **DISTRIBUTOR_ROLE** | Logistics companies | Can receive batches, add transport updates |
| **RETAILER_ROLE** | Retail stores | Can receive final batches, mark as delivered |
| **ORACLE_ROLE** | IoT sensors/systems | Can submit automated temperature readings |

## How to Grant Roles

### Method 1: Frontend Admin Panel (Recommended)

1. **Start the system:**
   ```bash
   # Terminal 1: Start blockchain
   npm run node
   
   # Terminal 2: Deploy contract
   npm run deploy:local
   
   # Terminal 3: Start frontend
   npm run frontend:start
   ```

2. **Connect as Admin:**
   - Open `http://localhost:3000`
   - Connect MetaMask with the deployer account (has admin role)

3. **Grant roles:**
   - Go to Admin Panel (`/admin`)
   - Click "Grant Role"
   - Enter the wallet address
   - Select the role type
   - Click "Grant Role"

### Method 2: Command Line Scripts

#### Option A: Batch Role Setup

1. **Edit the setup script:**
   ```javascript
   // Edit scripts/setup-roles.js
   const participants = {
     processors: [
       "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Add real addresses
     ],
     distributors: [
       "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
     ],
     retailers: [
       "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
     ],
     oracles: [
       "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
     ]
   };
   ```

2. **Run the setup:**
   ```bash
   npm run setup-roles
   ```

#### Option B: Single Role Grant

**Windows PowerShell:**
```powershell
$env:TARGET_ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
$env:ROLE_NAME="PROCESSOR_ROLE"
npm run grant-role
```

**Linux/Mac:**
```bash
TARGET_ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ROLE_NAME="PROCESSOR_ROLE" npm run grant-role
```

### Method 3: Direct Hardhat Console

```bash
npx hardhat console --network localhost
```

```javascript
// In Hardhat console
const Traceability = await ethers.getContractFactory("Traceability");
const contract = Traceability.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

// Grant processor role
const PROCESSOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROCESSOR_ROLE"));
const tx = await contract.grantRole(PROCESSOR_ROLE, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
await tx.wait();
```

## Getting Test Addresses

When using Hardhat local network, you get 20 test accounts:

```bash
npx hardhat node
```

Example addresses (use these for testing):
- Account #0 (Admin): `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Account #1 (Processor): `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Account #2 (Distributor): `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Account #3 (Retailer): `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Account #4 (Oracle): `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`

## Verifying Roles

### Frontend Verification
- Connect with different accounts
- Check if UI shows appropriate options based on roles

### Script Verification
```bash
npx hardhat console --network localhost
```

```javascript
const contract = Traceability.attach("CONTRACT_ADDRESS");
const PROCESSOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROCESSOR_ROLE"));
const hasRole = await contract.hasRole(PROCESSOR_ROLE, "USER_ADDRESS");
console.log("Has processor role:", hasRole);
```

## Troubleshooting

### Common Issues

1. **"User does not have admin role"**
   - Make sure you're using the deployer account
   - Check if contract was deployed properly

2. **"User already has this role"**
   - This is normal - no action needed
   - User already has the required permissions

3. **"Invalid role name"**
   - Use exact role names: `PROCESSOR_ROLE`, `DISTRIBUTOR_ROLE`, `RETAILER_ROLE`, `ORACLE_ROLE`

4. **Frontend not showing admin options**
   - Ensure MetaMask is connected with admin account
   - Refresh the page after connecting
   - Check browser console for errors

### Gas Estimation

| Operation | Estimated Gas |
|-----------|---------------|
| Grant Role | ~46,000 gas |
| Revoke Role | ~24,000 gas |
| Check Role | Free (view function) |

## Security Notes

- Only grant roles to trusted addresses
- Regularly audit who has which roles
- Use the revoke function to remove outdated permissions
- In production, consider using a multi-signature wallet for admin functions

## Next Steps

After granting roles:
1. Test batch creation with processor accounts
2. Test ownership transfers between different role holders
3. Verify role-based UI changes in the frontend
4. Document your supply chain participant addresses
