const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  [owner] = await ethers.getSigners();

  const whitelistAddress = "0x65c069922eC0bfD0c2eE6bDf47B3F6Bbc31e4903";
  whitelist = await hre.ethers.getContractAt(
    "MerkleWhitelist",
    whitelistAddress
  );

  // await whitelist.updateRootHash(
  //   "0xf35fce7e64bbd53dd51ad04694086676edb643732a5b03d135ce5f9084806231"
  // );
  await whitelist.updateIsLimited(false);
  // await whitelist.updateRound();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
