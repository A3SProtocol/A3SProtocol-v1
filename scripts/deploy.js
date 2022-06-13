const hre = require("hardhat");

async function main() {
  let A3SWalletFactory, factory;
  let A3SWalletHelper, wlletHelper;
  let MerkleWhitelist, whitelist;
  let provider;
  let owner;

  provider = waffle.provider;
  [owner] = await ethers.getSigners();

  // Deploy A3SWalletHelper Library
  A3SWalletHelper = await ethers.getContractFactory("A3SWalletHelper");
  wlletHelper = await A3SWalletHelper.deploy();

  // Deploy Merkle Whitelist Contract
  MerkleWhitelist = await ethers.getContractFactory("MerkleWhitelist");
  whitelist = await MerkleWhitelist.deploy();

  // Deploy A3SWalletFactory
  A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory", {
    libraries: { A3SWalletHelper: wlletHelper.address },
  });
  factory = await upgrades.deployProxy(A3SWalletFactory, {
    unsafeAllow: ["external-library-linking"],
  });

  await factory.deployed();

  await factory.updateWhilelistAddress(whitelist.address);
  await whitelist.updateFactory(factory.address);

  // await factory.mintWallet(
  //   owner.address,
  //   hre.ethers.utils.formatBytes32String("0"),
  //   false,
  //   [hre.ethers.utils.formatBytes32String("")]
  // );

  // let A3SWalletFactory;
  // let factory;
  // let tokenId;
  // let walletAddress;
  // let owner, user1, user2;

  // [owner] = await ethers.getSigners();
  // console.log(owner.address);

  // A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");

  // factory = await upgrades.deployProxy(A3SWalletFactory, [""]);
  // console.log("A3SWalletFactory deployed to:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
