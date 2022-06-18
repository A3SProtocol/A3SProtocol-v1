const hre = require("hardhat");
const { exec } = require("child_process");

async function main() {
  [owner] = await ethers.getSigners();

  Erc20Token = await hre.ethers.getContractFactory("TestToken");
  erc20Token = await Erc20Token.deploy();

  console.log("Erc20Token Address: ", erc20Token.address);

  await erc20Token.mint(
    "0x091a0e205Fb99A789e899b2cc67b05CB42E8477E",
    hre.ethers.utils.parseEther("1000")
  );
  await erc20Token.mint(
    "0x437672Ee962971e3fDa4366334B680724Ac9d89E",
    hre.ethers.utils.parseEther("1000")
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
