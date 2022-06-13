const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory;
  let factory;
  let Erc20Token;
  let erc20Token;
  let owner, user1, user2;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");
    factory = await upgrades.deployProxy(A3SWalletFactory, ["ipfs:/"]);

    await factory.deployed();

    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("0"),
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    Erc20Token = await hre.ethers.getContractFactory("TestToken");
    erc20Token = await Erc20Token.deploy();
  });

  it("FaitToken: Can update fiat token address", async () => {
    await factory.updateFiatToken(erc20Token.address);
    expect(await factory.fiatToken()).to.equal(erc20Token.address);
  });

  it("FaitToken: Should failed update fiat token address", async () => {
    try {
      await factory.connect(user1).updateFiatToken(erc20Token.address);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("FaitTokenFee: Can update fiat token fees", async () => {
    const feeAmount = 10;
    await factory.updateFiatTokenFee(feeAmount);
    expect(await factory.fiatTokenFee()).to.equal(feeAmount);
  });

  it("FaitTokenFee: Should failed update fiat token fees", async () => {
    try {
      const feeAmount = 10;
      await factory.connect(user1).updateFiatTokenFee(feeAmount);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("EtherFee: Can update ether fees", async () => {
    const feeAmount = 1;
    await factory.updateEtherFee(feeAmount);
    expect(await factory.etherFee()).to.equal(feeAmount);
  });

  it("EtherFee: Should failed update ether fees", async () => {
    try {
      const feeAmount = 1;
      await factory.connect(user1).updateEtherFee(feeAmount);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });
});
