# 🔧 Quick Fix: Role Granting Access Issue

## Problem
You're getting this error when trying to grant roles:
```
AccessControl: account 0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000
```

This means your current MetaMask account doesn't have admin privileges.

## ✅ Solution: Switch to Admin Account

### Step 1: Find the Admin Account
The admin account is the one that deployed the contract:
**Admin Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### Step 2: Add Admin Account to MetaMask

1. **Open MetaMask**
2. **Click on your account icon** (top right)
3. **Click "Add account or hardware wallet"**
4. **Select "Import account"**
5. **Paste this private key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   *(This is Hardhat's first test account - safe for local development)*

### Step 3: Switch to Admin Account
1. In MetaMask, **select the newly imported account**
2. **Refresh your browser** page
3. The Admin Panel should now show **"✅ Admin Access Granted"**

### Step 4: Grant Roles
Now you can grant roles to other accounts:

1. **Go to Admin Panel** (`/admin`)
2. **Click "Grant Role"**
3. **Enter the address** you want to grant role to:
   - `0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199` (your original account)
   - `0xa0Ee7A142d267C1f36714E4a8F75612F20a79720` (or any other account)
4. **Select role type** (Processor, Distributor, Retailer, Oracle)
5. **Click "Grant Role"**

## 🎯 Quick Test

After switching to admin account, try granting a role to your original account:

1. **Target Address:** `0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199`
2. **Role:** `PROCESSOR_ROLE`
3. **Click Grant**

You should see: **"✅ Role granted successfully!"**

## 🔄 Alternative: Command Line Method

If you prefer command line:

```powershell
# Windows PowerShell
$env:TARGET_ADDRESS="0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"
$env:ROLE_NAME="PROCESSOR_ROLE"
npm run grant-role
```

## 📝 Available Test Accounts

Here are Hardhat's default test accounts you can use:

| Account | Address | Role Suggestion |
|---------|---------|-----------------|
| Account #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | **Admin** (already set) |
| Account #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Processor |
| Account #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | Distributor |
| Account #3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | Retailer |
| Account #4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | Oracle |

## 🎉 Expected Result

After fixing:
- ✅ Admin Panel shows green success alert
- ✅ Role Grant/Revoke buttons are enabled
- ✅ You can successfully grant roles to any address
- ✅ Other accounts can then perform role-specific actions

## 🆘 Still Having Issues?

1. **Clear browser cache** and reload
2. **Restart MetaMask**
3. **Check Hardhat node is running** (`npm run node`)
4. **Verify contract is deployed** (`npm run deploy:local`)

The updated UI will now show you exactly what's wrong and guide you to the solution!
