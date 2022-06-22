const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  [owner] = await ethers.getSigners();

  const factoryAddress = "0xC59C241f842bBB6834D7f00eB5Dda438617562eD";
  factory = await hre.ethers.getContractAt("A3SWalletFactory", factoryAddress);

  const walletAddress = await factory.mintWallet(
    owner.address,
    hre.ethers.utils.formatBytes32String("9527"),
    false,
    [hre.ethers.utils.formatBytes32String("")]
  );

  console.log(walletAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
