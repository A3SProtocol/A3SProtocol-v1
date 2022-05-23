const { expect } = require("chai");

describe("Wallet Manager Contract", () => {
  let WalletManager;
  let walletManager;
  //
  let Wallet;
  let wallet;
  let walletAddress;
  let walletId;
  //
  let provider;
  let owner;
  let user1;
  let user2;
  let users;

  beforeEach(async () => {
    provider = hre.waffle.provider;
    [owner, user1, user2, ...users] = await ethers.getSigners();
    WalletManager = await hre.ethers.getContractFactory("WalletManager");
    walletManager = await WalletManager.deploy("A3SProtocol", "A3S");

    await owner.sendTransaction({
      to: walletManager.address,
      value: hre.ethers.utils.parseEther("1.0"),
    });

    await walletManager.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("0")
    );
    walletId = 1;

    Wallet = await hre.ethers.getContractFactory("Wallet");
    walletAddress = await walletManager.walletAddressOf(walletId);

    wallet = await hre.ethers.getContractAt("Wallet", walletAddress);
  });

  it("Deployment: Can Deploy Wallet Manager Contract", async () => {
    expect(walletManager.address).to.have.length.above(0);
    expect(await walletManager.name()).to.equal("A3SProtocol");
    expect(await walletManager.symbol()).to.equal("A3S");
  });

  it("Mint: Can Mint a New Wallet", async () => {
    let walletAddress = await walletManager.walletAddressOf(walletId);

    expect(await walletManager.ownerOf(walletId)).to.equal(user1.address);

    expect(
      await walletManager.walletOwnerOfWalletAddress(walletAddress)
    ).to.equal(user1.address);
  });

  it("Approve: Can Approve Wallet", async () => {
    await walletManager.connect(user1).approve(user2.address, walletId);

    expect(await walletManager.getApproved(walletId)).to.equal(user2.address);
  });

  it("Approve: Failed to Approve Wallet (only owner)", async () => {
    try {
      await walletManager.approve(user2.address, walletId);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes(
        "ERC721: approve caller is not owner nor approved for all"
      );
    }
  });

  it("SetApprovalForAll: Can SetApprovalForAll Wallet", async () => {
    await walletManager.connect(user1).setApprovalForAll(user2.address, true);

    expect(
      await walletManager.isApprovedForAll(user1.address, user2.address)
    ).to.equal(true);
  });

  it("TransferFrom: Can TransferFrom Wallet", async () => {
    await walletManager
      .connect(user1)
      .transferFrom(user1.address, user2.address, walletId);

    expect(await walletManager.ownerOf(walletId)).to.equal(user2.address);

    expect(await wallet.owner()).to.equal(walletManager.address);

    expect(await wallet.walletOwner()).to.equal(user2.address);
  });

  it("TransferFrom: Failed TransferFrom Walle (only owner)", async () => {
    try {
      await walletManager.transferFrom(user1.address, user2.address, walletId);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes(
        "ERC721: transfer caller is not owner nor approved"
      );
    }
  });

  it("WalletOwnerOfWalletAddress: Should return Wallet Owner", async () => {
    expect(
      await walletManager.walletOwnerOfWalletAddress(walletAddress)
    ).to.equal(user1.address);
  });

  it("WalletAddressWithSalt: Should return Wallet Address with Given Salt and target ", async () => {
    expect(
      await walletManager.walletAddressWithSalt(
        hre.ethers.utils.formatBytes32String("0"),
        user1.address
      )
    ).to.equal(walletAddress);
  });
});
