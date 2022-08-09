const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const deployHelper = require("./utils/deplotHelper");

describe("A3SWalletFactory Contract", () => {
  let wlletHelper, factory, whitelist, erc20;
  let provider;
  let Deployer, User1, User2;

  beforeEach(async () => {
    provider = waffle.provider;
    [Deployer, User1, User2] = await ethers.getSigners();

    erc20 = await deployHelper.deployErc20();
    whitelist = await deployHelper.deployMerkleWhitelist();
    wlletHelper = await deployHelper.deployWalletHelper();
    factory = await deployHelper.deployWalletFactory();

    await deployHelper.connectFactoryAndWhitelist();
    factory = await deployHelper.upgradeWalletFactoryV2();
  });

  it("Fee: Can update fiat token address, fiat token fee amount, and ether fee amount", async () => {
    const tokenFeeAmount = 10;
    const etherFeeAmount = 1;
    await factory.updateFee(erc20.address, tokenFeeAmount, etherFeeAmount);

    expect(await factory.fiatToken()).to.equal(erc20.address);
    expect(await factory.fiatTokenFee()).to.equal(tokenFeeAmount);
    expect(await factory.etherFee()).to.equal(etherFeeAmount);
  });

  it("Fee: Should failed update fiat token address, fiat token fee amount, and ether fee amount", async () => {
    const tokenFeeAmount = 10;
    const etherFeeAmount = 1;
    try {
      await factory
        .connect(User1)
        .updateFee(erc20.address, tokenFeeAmount, etherFeeAmount);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });
});
