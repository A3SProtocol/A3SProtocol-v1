const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  let A3SWalletFactory, factory;
  let A3SWalletHelper, walletHelper;
  let MerkleWhitelist, whitelist;
  let provider;
  let owner;

  provider = waffle.provider;
  [owner] = await ethers.getSigners();

  // Deploy A3SWalletHelper Library
  A3SWalletHelper = await ethers.getContractFactory("A3SWalletHelper");
  walletHelper = await A3SWalletHelper.deploy();

  // Deploy Merkle Whitelist Contract
  MerkleWhitelist = await ethers.getContractFactory("MerkleWhitelist");
  whitelist = await MerkleWhitelist.deploy();

  // Deploy A3SWalletFactory
  A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory", {
    libraries: { A3SWalletHelper: walletHelper.address },
  });
  factory = await upgrades.deployProxy(A3SWalletFactory, {
    unsafeAllow: ["external-library-linking"],
  });

  await factory.deployed();

  await factory.updateWhilelistAddress(whitelist.address);
  await whitelist.updateFactory(factory.address);

  console.log("A3SWalletHelper Address: ", walletHelper.address);
  verify(walletHelper.address);

  console.log("MerkleWhitelist Address: ", whitelist.address);
  verify(whitelist.address);

  console.log("A3SWalletFactoryProxy Address: ", factory.address);
  verify(factory.address);
}

function verify(address) {
  exec(
    `npx hardhat --network mumbai verify ${address}`,
    (err, stdout, stderr) => {
      if (err) {
        console.log(stderr);
      } else {
        console.log(stdout);
      }
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
