const hre = require("hardhat");
const { exec } = require("child_process");

const BASE_META_URI = "https://www-t.a3sprotocol.xyz/api/nft/";
const WHITELIST_EXECUTOR = "0x4aAbCC2aDcaC52706156Ed7BFEb0294A649F5684";

const deployWalletHelper = async () => {
  const A3SWalletHelper = await ethers.getContractFactory("A3SWalletHelper");
  const walletHelper = await A3SWalletHelper.deploy();
  console.log("A3SWalletHelper Address: ", walletHelper.address);

  return walletHelper;
};

const deployMerkleWhitelist = async () => {
  const MerkleWhitelist = await ethers.getContractFactory("MerkleWhitelist");
  const whitelist = await MerkleWhitelist.deploy();
  console.log("MerkleWhitelist Address: ", whitelist.address);

  return whitelist;
};

const deployA3SWallet = async (walletHelper) => {
  const A3SWalletFactory = await hre.ethers.getContractFactory(
    "A3SWalletFactory",
    {
      libraries: { A3SWalletHelper: walletHelper.address },
    }
  );
  const factory = await upgrades.deployProxy(A3SWalletFactory, {
    unsafeAllow: ["external-library-linking"],
  });
  console.log("A3SWalletFactoryProxy Address: ", factory.address);

  await factory.deployed();

  return factory;
};

async function main() {
  const walletHelper = await deployWalletHelper();

  const whitelist = await deployMerkleWhitelist();

  const factory = await deployA3SWallet(walletHelper);

  await factory.updateWhilelistAddress(whitelist.address);

  await factory.updateBaseMetaURI(BASE_META_URI);

  await whitelist.updateFactory(factory.address);

  await whitelist.updateExecutor(WHITELIST_EXECUTOR);

  // await whitelist.updateIsLimited(true);
  // await whitelist.updateRound();

  console.log("Waiting for verify .....");
  setTimeout(() => {
    verify("A3SWalletHelper", walletHelper.address, []);
    verify("MerkelWhitelist", whitelist.address, []);
    verify("A3SWalletFactory", factory.address, []);
  }, 120000);
}

function verify(name, address, params) {
  var comment = `npx hardhat --network mumbai verify ${address}`;

  params.map((param) => {
    comment = comment + " " + param;
  });

  exec(comment, (err, stdout, stderr) => {
    console.log("---------------------------------------------------");
    console.log("Verify ", name);
    console.log(comment);
    if (err) {
      console.log(stderr);
    } else {
      console.log(stdout);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
