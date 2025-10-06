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
            // Add more processor addresses here:
            // "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Example: Second Hardhat account
        ],
        distributors: [
            // Add distributor addresses here:
            // "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Example: Third Hardhat account
        ],
        retailers: [
            // Add retailer addresses here:
            // "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Example: Fourth Hardhat account
        ],
        oracles: [
            // Add oracle addresses here:
            // "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Example: Fifth Hardhat account
        ]
    };

    console.log("\n--- Role Assignment ---");
    console.log("ℹ️  To grant roles to specific addresses, uncomment and update the addresses above.");
    console.log("ℹ️  You can also use the Admin Panel in the frontend for individual role management.");
    
    // Helper function to grant role with error handling
    const grantRoleWithErrorHandling = async (roleType, roleName, address) => {
        try {
            console.log(`\n⏳ Granting ${roleName} to: ${address}`);
            const tx = await traceability.grantRole(roleType, address);
            await tx.wait();
            console.log(`✅ Successfully granted ${roleName} to: ${address}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to grant ${roleName} to: ${address}`);
            console.error(`   Error: ${error.message}`);
            return false;
        }
    };
    
    
    // Grant processor roles
    let successCount = 0;
    let totalAttempts = 0;
    
    for (const processor of participants.processors) {
        totalAttempts++;
        const success = await grantRoleWithErrorHandling(PROCESSOR_ROLE, "PROCESSOR_ROLE", processor);
        if (success) successCount++;
    }
    
    // Grant distributor roles
    for (const distributor of participants.distributors) {
        totalAttempts++;
        const success = await grantRoleWithErrorHandling(DISTRIBUTOR_ROLE, "DISTRIBUTOR_ROLE", distributor);
        if (success) successCount++;
    }
    
    // Grant retailer roles
    for (const retailer of participants.retailers) {
        totalAttempts++;
        const success = await grantRoleWithErrorHandling(RETAILER_ROLE, "RETAILER_ROLE", retailer);
        if (success) successCount++;
    }
    
    // Grant oracle roles
    for (const oracle of participants.oracles) {
        totalAttempts++;
        const success = await grantRoleWithErrorHandling(ORACLE_ROLE, "ORACLE_ROLE", oracle);
        if (success) successCount++;
    }
    
    console.log("\n--- Role Verification ---");
    
    // Verify admin still has all necessary roles
    const adminHasProcessor = await traceability.hasRole(PROCESSOR_ROLE, admin.address);
    console.log("Admin has PROCESSOR_ROLE:", adminHasProcessor ? "✅" : "❌");
    
    // Show current role holders (for verification)
    console.log("\n--- Role Assignment Summary ---");
    if (totalAttempts === 0) {
        console.log("ℹ️  No additional addresses configured for role assignment.");
        console.log("ℹ️  To grant roles, edit the participants object in this script.");
        console.log("ℹ️  Or use the Admin Panel in the frontend for individual role management.");
    } else {
        console.log(`📊 Roles granted: ${successCount}/${totalAttempts} successful`);
    }
    
    console.log("\n--- Current Admin Setup ---");
    console.log("Admin Address:", admin.address);
    console.log("Has DEFAULT_ADMIN_ROLE: ✅");
    console.log("Has PROCESSOR_ROLE: ✅");
    
    console.log("\n--- Alternative: Use Frontend Admin Panel ---");
    console.log("1. Start the frontend: cd frontend && npm start");
    console.log("2. Connect with the admin wallet");
    console.log("3. Go to Admin Panel (/admin)");
    console.log("4. Use 'Grant Role' button to assign roles to specific addresses");
    
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
