const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  [owner] = await ethers.getSigners();

  const factoryAddress = "0xC59C241f842bBB6834D7f00eB5Dda438617562eD";
  factory = await hre.ethers.getContractAt("A3SWalletFactory", factoryAddress);

  const whitelistAddress = "0x0BfB50A37C95306f4bfD4855C076e72eA2c903F0";
  whitelist = await hre.ethers.getContractAt(
    "MerkleWhitelist",
    whitelistAddress
  );

  console.log(
    await whitelist.claimedWhitelist(
      "0x437672Ee962971e3fDa4366334B680724Ac9d89E"
    )
  );

  console.log(
    await whitelist.claimedWhitelist(
      "0x091a0e205Fb99A789e899b2cc67b05CB42E8477E"
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
