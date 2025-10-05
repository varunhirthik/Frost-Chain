// scripts/setup-roles.js
/**
 * FROST-CHAIN Role Setup Script
 * 
 * This script sets up roles for supply chain participants after deployment.
 * It should be run after the main deployment script.
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== FROST-CHAIN ROLE SETUP SCRIPT ===\n");
    
    // Get the deployed contract address from command line or deployment file
    let contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!contractAddress) {
        // Try to load from deployment file
        try {
            const fs = require('fs');
            const path = require('path');
            const deploymentFile = path.join(__dirname, '..', 'deployments', `${hre.network.name}-deployment.json`);
            const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
            contractAddress = deploymentInfo.contractAddress;
            console.log("Loaded contract address from deployment file:", contractAddress);
        } catch (error) {
            console.error("❌ Could not find contract address.");
            console.error("Please set CONTRACT_ADDRESS environment variable or ensure deployment file exists.");
            process.exit(1);
        }
    }
    
    // Get the signer (should be the admin)
    const [admin] = await ethers.getSigners();
    console.log("Setting up roles with admin account:", admin.address);
    
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
    const PROCESSOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROCESSOR_ROLE"));
    const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
    const RETAILER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    
    console.log("\n--- Available Roles ---");
    console.log("PROCESSOR_ROLE:", PROCESSOR_ROLE);
    console.log("DISTRIBUTOR_ROLE:", DISTRIBUTOR_ROLE);
    console.log("RETAILER_ROLE:", RETAILER_ROLE);
    console.log("ORACLE_ROLE:", ORACLE_ROLE);
    
    // Example addresses - in production, these would be real participant addresses
    const participants = {
        // These are example addresses - replace with real addresses in production
        processors: [
            // admin already has processor role
        ],
        distributors: [
            // Add distributor addresses here
            // "0x1234567890123456789012345678901234567890"
        ],
        retailers: [
            // Add retailer addresses here
            // "0x0987654321098765432109876543210987654321"
        ],
        oracles: [
            // Add oracle addresses here
            // "0x1111111111111111111111111111111111111111"
        ]
    };
    
    console.log("\n--- Role Assignment ---");
    console.log("ℹ️  Current setup uses example addresses. In production, replace with actual participant addresses.");
    
    // Grant processor roles
    for (const processor of participants.processors) {
        try {
            const tx = await traceability.grantRole(PROCESSOR_ROLE, processor);
            await tx.wait();
            console.log("✅ Granted PROCESSOR_ROLE to:", processor);
        } catch (error) {
            console.error("❌ Failed to grant PROCESSOR_ROLE to:", processor);
            console.error(error.message);
        }
    }
    
    // Grant distributor roles
    for (const distributor of participants.distributors) {
        try {
            const tx = await traceability.grantRole(DISTRIBUTOR_ROLE, distributor);
            await tx.wait();
            console.log("✅ Granted DISTRIBUTOR_ROLE to:", distributor);
        } catch (error) {
            console.error("❌ Failed to grant DISTRIBUTOR_ROLE to:", distributor);
            console.error(error.message);
        }
    }
    
    // Grant retailer roles
    for (const retailer of participants.retailers) {
        try {
            const tx = await traceability.grantRole(RETAILER_ROLE, retailer);
            await tx.wait();
            console.log("✅ Granted RETAILER_ROLE to:", retailer);
        } catch (error) {
            console.error("❌ Failed to grant RETAILER_ROLE to:", retailer);
            console.error(error.message);
        }
    }
    
    // Grant oracle roles
    for (const oracle of participants.oracles) {
        try {
            const tx = await traceability.grantRole(ORACLE_ROLE, oracle);
            await tx.wait();
            console.log("✅ Granted ORACLE_ROLE to:", oracle);
        } catch (error) {
            console.error("❌ Failed to grant ORACLE_ROLE to:", oracle);
            console.error(error.message);
        }
    }
    
    console.log("\n--- Role Verification ---");
    
    // Verify admin still has all necessary roles
    const adminHasProcessor = await traceability.hasRole(PROCESSOR_ROLE, admin.address);
    console.log("Admin has PROCESSOR_ROLE:", adminHasProcessor ? "✅" : "❌");
    
    // Show current role holders (for verification)
    console.log("\n--- Current Role Summary ---");
    console.log("Admin (DEFAULT_ADMIN_ROLE + PROCESSOR_ROLE):", admin.address);
    
    // In a production environment, you might want to create a more comprehensive
    // role management interface or read participant addresses from a configuration file
    
    console.log("\n--- Next Steps ---");
    console.log("1. Verify all participant addresses are correct");
    console.log("2. Test the system with the assigned roles");
    console.log("3. Update frontend configuration with contract address");
    console.log("4. Provide participant addresses to frontend for role-based UI");
    
    console.log("\n🎉 Role setup completed!\n");
}

// Handle errors and run setup
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Role setup failed:");
        console.error(error);
        process.exit(1);
    });
