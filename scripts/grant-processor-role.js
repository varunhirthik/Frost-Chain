const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting role grant process...");
  
  // Get the deployed contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Traceability = await ethers.getContractFactory("Traceability");
  const contract = Traceability.attach(contractAddress);
  
  // Get signers (accounts)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer account:", deployer.address);
  
  // The account that needs PROCESSOR_ROLE (Account 5 from MetaMask)
  // Replace this with your MetaMask Account 5 address if different
  const targetAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // This should be your MetaMask Account 5
  
  // Alternative addresses you can try:
  // Account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  // Account 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  // Account 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  // Account 3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
  // Account 4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
  // If your MetaMask Account 5 has a different address, replace targetAccount above
  
  console.log("🎯 Target account for PROCESSOR_ROLE:", targetAccount);
  
  // Get role constants
  const PROCESSOR_ROLE = await contract.PROCESSOR_ROLE();
  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  
  console.log("🔑 PROCESSOR_ROLE:", PROCESSOR_ROLE);
  
  // Check current roles
  const hasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, targetAccount);
  const hasProcessor = await contract.hasRole(PROCESSOR_ROLE, targetAccount);
  
  console.log("👤 Current roles for", targetAccount + ":");
  console.log("  👑 Admin:", hasAdmin);
  console.log("  🏭 Processor:", hasProcessor);
  
  // Grant PROCESSOR_ROLE if not already granted
  if (!hasProcessor) {
    console.log("⏳ Granting PROCESSOR_ROLE...");
    const tx = await contract.grantRole(PROCESSOR_ROLE, targetAccount);
    await tx.wait();
    console.log("✅ PROCESSOR_ROLE granted successfully!");
    console.log("📝 Transaction hash:", tx.hash);
  } else {
    console.log("ℹ️ Account already has PROCESSOR_ROLE");
  }
  
  // Also grant ADMIN role if not already granted
  if (!hasAdmin) {
    console.log("⏳ Granting DEFAULT_ADMIN_ROLE...");
    const tx = await contract.grantRole(DEFAULT_ADMIN_ROLE, targetAccount);
    await tx.wait();
    console.log("✅ DEFAULT_ADMIN_ROLE granted successfully!");
    console.log("📝 Transaction hash:", tx.hash);
  } else {
    console.log("ℹ️ Account already has DEFAULT_ADMIN_ROLE");
  }
  
  // Verify final roles
  const finalAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, targetAccount);
  const finalProcessor = await contract.hasRole(PROCESSOR_ROLE, targetAccount);
  
  console.log("\n🎉 Final roles for", targetAccount + ":");
  console.log("  👑 Admin:", finalAdmin);
  console.log("  🏭 Processor:", finalProcessor);
  
  if (finalAdmin && finalProcessor) {
    console.log("\n✅ SUCCESS! Account can now create batches!");
  } else {
    console.log("\n❌ ERROR: Roles not properly assigned");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
