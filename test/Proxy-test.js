const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory;
  let factory;
  let tokenId;
  let walletAddress;
  let owner, user1, user2;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    console.log(await owner.getBalance());
    console.log(await user1.getBalance());
    console.log(await user2.getBalance());

    A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");
    factory = await upgrades.deployProxy(A3SWalletFactory, [
      "A3SProtocol",
      "A3S",
    ]);

    // await factory.mintWallet(
    //   user1.address,
    //   hre.ethers.utils.formatBytes32String("0"),
    //   false,
    //   [hre.ethers.utils.formatBytes32String("")]
    // );

    // tokenId = 1;
    // walletAddress = await factory.walletOf(tokenId);
  });

  it("Deployment: Can Deploy A3SWalletFactory Contract", async () => {
    console.log("Factory address: ", factory.address);

    expect(factory.address).to.have.length.above(0);
    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
  });
});
