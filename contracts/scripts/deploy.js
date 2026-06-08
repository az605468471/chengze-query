import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  
  // BSC USDT address
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
  const QUERY_PRICE = hre.ethers.parseUnits("1", 18); // 1 USDT
  
  // Deploy Query Contract
  console.log("Deploying DefiShieldQuery...");
  const DefiShieldQuery = await hre.ethers.getContractFactory("DefiShieldQuery");
  const query = await DefiShieldQuery.deploy(USDT_ADDRESS);
  await query.waitForDeployment();
  
  const queryAddress = await query.getAddress();
  console.log("DefiShieldQuery deployed to:", queryAddress);
  
  // Deploy Factory Contract
  console.log("Deploying DefiShieldQueryFactory...");
  const DefiShieldQueryFactory = await hre.ethers.getContractFactory("DefiShieldQueryFactory");
  const factory = await DefiShieldQueryFactory.deploy(USDT_ADDRESS, QUERY_PRICE);
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("DefiShieldQueryFactory deployed to:", factoryAddress);
  
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Query Contract:", queryAddress);
  console.log("Factory Contract:", factoryAddress);
  console.log("Payment Token (USDT):", USDT_ADDRESS);
  console.log("Query Price:", hre.ethers.formatUnits(QUERY_PRICE, 18), "USDT");
  
  console.log("\n=== Verify Commands ===");
  console.log(`npx hardhat verify --network bsc ${queryAddress} "${USDT_ADDRESS}"`);
  console.log(`npx hardhat verify --network bsc ${factoryAddress} "${USDT_ADDRESS}" "${QUERY_PRICE}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
