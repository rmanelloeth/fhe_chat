import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying ChatRoom contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const ChatRoom = await ethers.getContractFactory("ChatRoom");
  const chatRoom = await ChatRoom.deploy();

  await chatRoom.waitForDeployment();

  const address = await chatRoom.getAddress();
  console.log("ChatRoom deployed to:", address);

  // Save deployment info
  console.log("\n=== Deployment Info ===");
  console.log("Contract Address:", address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

