// scripts/verify-contract.js
/**
 * FROST-CHAIN Contract Verification Script
 * 
 * This script verifies the deployed contract on Etherscan or other block explorers.
 * This is crucial for transparency and trust in the decentralized system.
 */

const { run } = require("hardhat");

async function main() {
    console.log("\n=== FROST-CHAIN CONTRACT VERIFICATION ===\n");
    
    // Get contract address from command line or deployment file
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
            console.error("Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-contract.js --network <network>");
            process.exit(1);
        }
    }
    
    console.log("Verifying contract at address:", contractAddress);
    console.log("Network:", hre.network.name);
    
    // Check if we're on a local network (verification not needed)
    if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
        console.log("⚠️  Verification is not needed for local networks.");
        console.log("Contract is already available for local testing.");
        return;
    }
    
    // Check if Etherscan API key is configured
    if (!process.env.ETHERSCAN_API_KEY && !hre.config.etherscan?.apiKey) {
        console.warn("⚠️  Warning: ETHERSCAN_API_KEY not found.");
        console.warn("Please set ETHERSCAN_API_KEY in your .env file for verification.");
        console.warn("You can get a free API key from https://etherscan.io/apis");
        return;
    }
    
    try {
        console.log("\n--- Starting Verification Process ---");
        
        // The Traceability contract constructor takes no arguments
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // No constructor arguments for our contract
            contract: "contracts/Traceability.sol:Traceability"
        });
        
        console.log("✅ Contract verification completed successfully!");
        
        // Provide useful links
        const explorerUrls = {
            'mainnet': 'https://etherscan.io',
            'goerli': 'https://goerli.etherscan.io',
            'sepolia': 'https://sepolia.etherscan.io',
            'polygon': 'https://polygonscan.com',
            'mumbai': 'https://mumbai.polygonscan.com'
        };
        
        const baseUrl = explorerUrls[hre.network.name] || 'https://etherscan.io';
        const contractUrl = `${baseUrl}/address/${contractAddress}`;
        
        console.log("\n--- Verification Complete ---");
        console.log("Contract Address:", contractAddress);
        console.log("Explorer URL:", contractUrl);
        console.log("\n📋 What this means:");
        console.log("- Source code is now publicly available and verified");
        console.log("- Users can read the contract code on the block explorer");
        console.log("- The bytecode matches the provided source code");
        console.log("- This enhances trust and transparency in the system");
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified!");
        } else if (error.message.includes("API key")) {
            console.error("❌ Verification failed: Invalid or missing API key");
            console.error("Please check your ETHERSCAN_API_KEY in the .env file");
        } else if (error.message.includes("constructor arguments")) {
            console.error("❌ Verification failed: Constructor arguments mismatch");
            console.error("This shouldn't happen for the Traceability contract as it has no constructor arguments");
        } else {
            console.error("❌ Verification failed:");
            console.error(error.message);
            
            console.log("\n🔧 Troubleshooting:");
            console.log("1. Ensure the contract is fully deployed and confirmed");
            console.log("2. Check that ETHERSCAN_API_KEY is correct");
            console.log("3. Verify you're using the correct network");
            console.log("4. Wait a few minutes and try again");
            console.log("5. Manual verification: Upload source code directly to Etherscan");
        }
    }
}

// Handle errors and run verification
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Verification script failed:");
        console.error(error);
        process.exit(1);
    });
