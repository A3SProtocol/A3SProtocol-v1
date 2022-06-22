const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  [owner] = await ethers.getSigners();

  const factoryAddress = "0x302DF59f52F0331019b2bc2e37962D0c845682C9";
  factory = await hre.ethers.getContractAt("A3SWalletFactory", factoryAddress);

  await factory.updateBaseMetaURI("https://ipfs.a3sprotocol.xyz/ipfs/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
