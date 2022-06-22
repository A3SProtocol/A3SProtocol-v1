const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory, factory;
  let A3SWalletHelper, wlletHelper;
  let MerkleWhitelist, whitelist;
  let Erc20Token, erc20Token;
  let provider;
  let owner, user1, user2;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy A3SWalletHelper Library
    A3SWalletHelper = await ethers.getContractFactory("A3SWalletHelper");
    wlletHelper = await A3SWalletHelper.deploy();

    // Deploy Merkle Whitelist Contract
    MerkleWhitelist = await ethers.getContractFactory("MerkleWhitelist");
    whitelist = await MerkleWhitelist.deploy();

    // Deploy A3SWalletFactory
    A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory", {
      libraries: { A3SWalletHelper: wlletHelper.address },
    });
    factory = await upgrades.deployProxy(A3SWalletFactory, {
      unsafeAllow: ["external-library-linking"],
    });

    await factory.deployed();

    Erc20Token = await hre.ethers.getContractFactory("TestToken");
    erc20Token = await Erc20Token.deploy();
  });

  it("Fee: Can update fiat token address, fiat token fee amount, and ether fee amount", async () => {
    const tokenFeeAmount = 10;
    const etherFeeAmount = 1;
    await factory.updateFee(erc20Token.address, tokenFeeAmount, etherFeeAmount);

    expect(await factory.fiatToken()).to.equal(erc20Token.address);
    expect(await factory.fiatTokenFee()).to.equal(tokenFeeAmount);
    expect(await factory.etherFee()).to.equal(etherFeeAmount);
  });

  it("Fee: Should failed update fiat token address, fiat token fee amount, and ether fee amount", async () => {
    const tokenFeeAmount = 10;
    const etherFeeAmount = 1;
    try {
      await factory
        .connect(user1)
        .updateFee(erc20Token.address, tokenFeeAmount, etherFeeAmount);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });
});
