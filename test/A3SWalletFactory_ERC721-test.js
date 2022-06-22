const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory, factory;
  let A3SWalletHelper, wlletHelper;
  let MerkleWhitelist, whitelist;
  let tokenId, walletAddress;
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

    await factory.updateWhilelistAddress(whitelist.address);
    await whitelist.updateFactory(factory.address);

    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("0"),
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    tokenId = 1;
    walletAddress = await factory.walletOf(tokenId);
  });

  it("Approve: Can Approve Wallet", async () => {
    await factory.connect(user1).approve(user2.address, tokenId);

    expect(await factory.getApproved(tokenId)).to.equal(user2.address);
  });

  it("Approve: Failed to Approve Wallet (only owner)", async () => {
    try {
      await factory.approve(user2.address, tokenId);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes(
        "ERC721: approve caller is not owner nor approved for all"
      );
    }
  });

  it("SetApprovalForAll: Can SetApprovalForAll Wallet", async () => {
    await factory.connect(user1).setApprovalForAll(user2.address, true);

    expect(
      await factory.isApprovedForAll(user1.address, user2.address)
    ).to.equal(true);
  });

  it("TransferFrom: Can TransferFrom Wallet", async () => {
    await factory
      .connect(user1)
      .transferFrom(user1.address, user2.address, tokenId);

    expect(await factory.ownerOf(tokenId)).to.equal(user2.address);
    expect(await factory.walletOwnerOf(walletAddress)).to.equal(user2.address);
    expect(await factory.balanceOf(user1.address)).to.equal(0);
    expect(await factory.balanceOf(user2.address)).to.equal(1);
  });

  it("TransferFrom: Failed TransferFrom Walle (only owner)", async () => {
    try {
      await factory.transferFrom(user1.address, user2.address, tokenId);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes(
        "ERC721: transfer caller is not owner nor approved"
      );
    }
  });
});
