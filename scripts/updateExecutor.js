const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  [owner] = await ethers.getSigners();

  const whitelistAddress = "0x0BfB50A37C95306f4bfD4855C076e72eA2c903F0";
  whitelist = await hre.ethers.getContractAt(
    "MerkleWhitelist",
    whitelistAddress
  );

  // 0x4aAbCC2aDcaC52706156Ed7BFEb0294A649F5684

  await whitelist.updateExecutor("0x4aAbCC2aDcaC52706156Ed7BFEb0294A649F5684");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
