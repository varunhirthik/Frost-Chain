// scripts/grant-single-role.js
/**
 * FROST-CHAIN Single Role Grant Script
 * 
 * This script grants a specific role to a specific address.
 * Usage: npx hardhat run scripts/grant-single-role.js --network localhost
 * 
 * Environment variables:
 * - CONTRACT_ADDRESS: The deployed contract address
 * - TARGET_ADDRESS: The address to grant the role to
 * - ROLE_NAME: The role to grant (PROCESSOR_ROLE, DISTRIBUTOR_ROLE, RETAILER_ROLE, ORACLE_ROLE)
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== FROST-CHAIN SINGLE ROLE GRANT SCRIPT ===\n");
    
    // Get parameters from environment variables or prompt
    const contractAddress = process.env.CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const targetAddress = process.env.TARGET_ADDRESS;
    const roleName = process.env.ROLE_NAME;
    
    if (!targetAddress || !roleName) {
        console.error("❌ Missing required parameters.");
        console.error("Usage examples:");
        console.error("1. Windows PowerShell:");
        console.error('   $env:TARGET_ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; $env:ROLE_NAME="PROCESSOR_ROLE"; npx hardhat run scripts/grant-single-role.js --network localhost');
        console.error("2. Command line:");
        console.error('   CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" TARGET_ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ROLE_NAME="PROCESSOR_ROLE" npx hardhat run scripts/grant-single-role.js --network localhost');
        console.error("");
        console.error("Available roles: PROCESSOR_ROLE, DISTRIBUTOR_ROLE, RETAILER_ROLE, ORACLE_ROLE");
        process.exit(1);
    }
    
    console.log("Contract Address:", contractAddress);
    console.log("Target Address:", targetAddress);
    console.log("Role Name:", roleName);
    
    // Get the admin signer
    const [admin] = await ethers.getSigners();
    console.log("Admin Address:", admin.address);
    
    // Connect to the deployed contract
    const Traceability = await ethers.getContractFactory("Traceability");
    const traceability = Traceability.attach(contractAddress);
    
    // Verify admin has the DEFAULT_ADMIN_ROLE
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasAdminRole = await traceability.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
    
    if (!hasAdminRole) {
        console.error("❌ Current account does not have admin role. Cannot proceed.");
        process.exit(1);
    }
    console.log("✅ Admin role verified");
    
    // Define role constants
    const roles = {
        "PROCESSOR_ROLE": ethers.keccak256(ethers.toUtf8Bytes("PROCESSOR_ROLE")),
        "DISTRIBUTOR_ROLE": ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE")),
        "RETAILER_ROLE": ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE")),
        "ORACLE_ROLE": ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"))
    };
    
    if (!roles[roleName]) {
        console.error("❌ Invalid role name:", roleName);
        console.error("Available roles:", Object.keys(roles).join(", "));
        process.exit(1);
    }
    
    const roleHash = roles[roleName];
    console.log("Role Hash:", roleHash);
    
    try {
        console.log("\n--- Checking Current Role Status ---");
        
        // Check if user already has the role
        const hasRole = await traceability.hasRole(roleHash, targetAddress);
        if (hasRole) {
            console.log("ℹ️  Target address already has this role.");
            console.log("✅ No action needed - role already granted.");
            return;
        }
        
        console.log("⏳ Target address does not have this role. Proceeding with grant...");
        
        // Grant the role
        console.log("\n--- Granting Role ---");
        const tx = await traceability.grantRole(roleHash, targetAddress);
        console.log("Transaction hash:", tx.hash);
        
        // Wait for confirmation
        console.log("⏳ Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed!");
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Verify the role was granted
        console.log("\n--- Verification ---");
        const nowHasRole = await traceability.hasRole(roleHash, targetAddress);
        if (nowHasRole) {
            console.log("✅ Role successfully granted!");
            console.log(`✅ ${targetAddress} now has ${roleName}`);
        } else {
            console.log("❌ Role grant verification failed");
        }
        
        console.log("\n🎉 Role grant completed successfully!\n");
        
    } catch (error) {
        console.error("\n❌ Failed to grant role:");
        console.error(error.message);
        process.exit(1);
    }
}

// Handle errors and run script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Script failed:");
        console.error(error);
        process.exit(1);
    });
