const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Wallet Manager Contract", () => {
  let WalletManager;
  let walletManager;
  let provider;
  let owner;
  let user1;
  let user2;
  let users;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2, ...users] = await ethers.getSigners();
    WalletManager = await ethers.getContractFactory("WalletManager");
    walletManager = await WalletManager.deploy(user1.address);
  });

  it("Deployment: Can Deploy Wallet Manager Contract", async () => {});

  it("Mint: Can Mint a New Wallet", async () => {});

  it("Approve: Can Approve Wallet", async () => {});

  it("Approve: Failed to Approve Wallet (only owner)", async () => {});

  it("SetApprovalForAll: Can SetApprovalForAll Wallet", async () => {});

  it("SetApprovalForAll: Failed SetApprovalForAll Wallet (only owner)", async () => {});

  it("TransferFrom: Can TransferFrom Wallet", async () => {});

  it("TransferFrom: Failed TransferFrom Walle (only owner)t", async () => {});

  it("GetWalletOwner: Can GetWalletOwner", async () => {});

  it("GetWalletAddressWithSalt: Can GetWalletAddressWithSalt", async () => {});
});
