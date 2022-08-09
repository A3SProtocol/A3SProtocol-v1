const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const deployHelper = require("./utils/deplotHelper");

describe("A3SWalletFactory Contract", () => {
  let wlletHelper, factory, whitelist, erc20;
  let tokenId, walletAddress;
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

    await factory.mintWallet(
      User1.address,
      hre.ethers.utils.formatBytes32String("0"),
      "",
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    tokenId = 1;
    walletAddress = await factory.walletOf(tokenId);
  });

  it("Approve: Can Approve Wallet", async () => {
    await factory.connect(User1).approve(User2.address, tokenId);

    expect(await factory.getApproved(tokenId)).to.equal(User2.address);
  });

  it("Approve: Failed to Approve Wallet (only owner)", async () => {
    try {
      await factory.approve(User2.address, tokenId);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes(
        "ERC721: approve caller is not owner nor approved for all"
      );
    }
  });

  it("SetApprovalForAll: Can SetApprovalForAll Wallet", async () => {
    await factory.connect(User1).setApprovalForAll(User2.address, true);

    expect(
      await factory.isApprovedForAll(User1.address, User2.address)
    ).to.equal(true);
  });

  it("TransferFrom: Can TransferFrom Wallet", async () => {
    await factory
      .connect(User1)
      .transferFrom(User1.address, User2.address, tokenId);

    expect(await factory.ownerOf(tokenId)).to.equal(User2.address);
    expect(await factory.walletOwnerOf(walletAddress)).to.equal(User2.address);
    expect(await factory.balanceOf(User1.address)).to.equal(0);
    expect(await factory.balanceOf(User2.address)).to.equal(1);
  });

  it("TransferFrom: Failed TransferFrom Walle (only owner)", async () => {
    try {
      await factory.transferFrom(User1.address, User2.address, tokenId);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes(
        "ERC721: transfer caller is not owner nor approved"
      );
    }
  });
});
