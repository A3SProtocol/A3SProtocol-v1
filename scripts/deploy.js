const hre = require("hardhat");

async function main() {
  let A3SWalletFactory;
  let factory;
  let tokenId;
  let walletAddress;
  let owner, user1, user2;

  [owner] = await ethers.getSigners();
  console.log(await owner.getBalance());

  A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");
  factory = await upgrades.deployProxy(A3SWalletFactory, [
    "A3SProtocol",
    "A3S",
  ]);

  console.log("A3SWalletFactory deployed to:", factory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
