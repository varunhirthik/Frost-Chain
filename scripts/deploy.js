// scripts/deploy.js
/**
 * FROST-CHAIN Deployment Script
 * 
 * This script deploys the Traceability smart contract to the specified network.
 * It includes:
 * - Contract deployment with proper verification
 * - Initial role setup for Rich Products (deployer)
 * - Gas estimation and deployment cost calculation
 * - Contract verification setup
 * - Post-deployment validation
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== FROST-CHAIN DEPLOYMENT SCRIPT ===\n");
    
    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Check account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
        console.warn("⚠️  Warning: Account balance is low. Ensure sufficient funds for deployment.");
    }
    
    console.log("\n--- Preparing Contract Deployment ---");
    
    // Get contract factory
    const Traceability = await ethers.getContractFactory("Traceability");
    
    // Estimate deployment gas
    const deployTransaction = await Traceability.getDeployTransaction();
    const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
    console.log("Estimated gas for deployment:", estimatedGas.toString());
    
    // Calculate deployment cost
    const gasPrice = (await ethers.provider.getFeeData()).gasPrice;
    const deploymentCost = estimatedGas * gasPrice;
    console.log("Estimated deployment cost:", ethers.formatEther(deploymentCost), "ETH");
    
    console.log("\n--- Deploying Contract ---");
    
    // Deploy the contract
    const traceability = await Traceability.deploy();
    
    // Wait for deployment to be mined
    await traceability.waitForDeployment();
    const contractAddress = await traceability.getAddress();
    
    console.log("✅ Traceability contract deployed to:", contractAddress);
    
    // Get deployment transaction details
    const deploymentTx = traceability.deploymentTransaction();
    if (deploymentTx) {
        console.log("Deployment transaction hash:", deploymentTx.hash);
        
        // Wait for transaction receipt
        const receipt = await deploymentTx.wait();
        console.log("Gas used for deployment:", receipt.gasUsed.toString());
        console.log("Actual deployment cost:", ethers.formatEther(receipt.gasUsed * receipt.gasPrice), "ETH");
    }
    
    console.log("\n--- Post-Deployment Validation ---");
    
    // Validate deployment
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
        throw new Error("❌ Contract deployment failed - no bytecode at address");
    }
    console.log("✅ Contract bytecode verified at address");
    
    // Verify initial roles
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const PROCESSOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROCESSOR_ROLE"));
    
    const hasAdminRole = await traceability.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasProcessorRole = await traceability.hasRole(PROCESSOR_ROLE, deployer.address);
    
    if (!hasAdminRole || !hasProcessorRole) {
        throw new Error("❌ Initial roles not properly assigned to deployer");
    }
    console.log("✅ Initial roles verified (DEFAULT_ADMIN_ROLE and PROCESSOR_ROLE assigned to deployer)");
    
    // Test basic functionality
    const initialBatchCount = await traceability.getBatchCount();
    if (initialBatchCount !== 0n) {
        throw new Error("❌ Initial batch count is not zero");
    }
    console.log("✅ Initial state verified (batch count = 0)");
    
    console.log("\n--- Deployment Summary ---");
    console.log("Contract Address:", contractAddress);
    console.log("Deployer Address:", deployer.address);
    console.log("Network:", hre.network.name);
    console.log("Block Number:", await ethers.provider.getBlockNumber());
    
    // Network-specific instructions
    if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
        console.log("\n📝 Local Network Deployment:");
        console.log("- Contract is ready for local testing");
        console.log("- Use this address in your frontend configuration");
        console.log("- No verification needed for local deployment");
    } else {
        console.log("\n📝 Public Network Deployment:");
        console.log("- Verify contract on Etherscan using:");
        console.log(`  npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
        console.log("- Update frontend configuration with new contract address");
        console.log("- Remember to grant roles to appropriate supply chain participants");
    }
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer.address,
        network: hre.network.name,
        blockNumber: await ethers.provider.getBlockNumber(),
        timestamp: new Date().toISOString(),
        gasUsed: deploymentTx ? (await deploymentTx.wait()).gasUsed.toString() : "N/A",
        deploymentCost: deploymentTx ? ethers.formatEther((await deploymentTx.wait()).gasUsed * (await deploymentTx.wait()).gasPrice) : "N/A"
    };
    
    // Write deployment info to file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    
    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFile);
    
    console.log("\n🎉 FROST-CHAIN deployment completed successfully!\n");
    
    return {
        contract: traceability,
        address: contractAddress,
        deployer: deployer.address
    };
}

// Handle errors and run deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
