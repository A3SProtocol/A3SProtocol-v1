const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  [owner] = await ethers.getSigners();

  const factoryAddress = "0x42BebE1fdE49B8ac08a4149CF4E0A6ADfea06A29";
  factory = await hre.ethers.getContractAt("A3SWalletFactory", factoryAddress);

  console.log(
    await factory.balanceOf("0xdB7ABd565D15bD2249fb8133DE132BF4a749F493")
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
