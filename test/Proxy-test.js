const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory;
  let proxy;
  let factory;

  let wallet;
  let tokenId;
  let walletAddress;

  let owner, user1, user2;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    console.log("Owner: ", owner.address);

    A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");
    factory = await upgrades.deployProxy(A3SWalletFactory, [
      "A3SProtocol",
      "A3S",
    ]);

    proxy = await factory.deployed();

    console.log("Proxy: ", proxy.address);
    console.log("Factory: ", factory.address);

    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("0"),
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    tokenId = 1;
    walletAddress = await factory.walletOf(tokenId);
    wallet = await hre.ethers.getContractAt("A3SWallet", walletAddress);

    console.log(await wallet.factory());
  });

  it("Deployment: Can Deploy A3SWalletFactory Contract", async () => {
    expect(factory.address).to.have.length.above(0);
    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
  });
});
