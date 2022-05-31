const { expect } = require("chai");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory;
  let factory;
  let tokenId;
  let walletAddress;
  let provider;
  let owner, user1, user2;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2] = await ethers.getSigners();
    A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");
    factory = await A3SWalletFactory.deploy("A3SProtocol", "A3S");

    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("0"),
      false
    );

    tokenId = 1;
    walletAddress = await factory.walletOf(tokenId);
  });

  it("Deployment: Can Deploy A3SWalletFactory Contract", async () => {
    expect(factory.address).to.have.length.above(0);
    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
  });

  it("MintWallet: Can Mint a New Wallet", async () => {
    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("1"),
      false
    );

    let secondTokenId = 2;
    let secondWalletAddress = await factory.walletOf(secondTokenId);

    expect(await factory.ownerOf(secondTokenId)).to.equal(user1.address);
    expect(await factory.walletIdOf(secondWalletAddress)).to.equal(
      secondTokenId
    );
    expect(await factory.walletOwnerOf(secondWalletAddress)).to.equal(
      user1.address
    );
    expect(await factory.balanceOf(user1.address)).to.equal(2);
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

  it("PredictWalletAddress: Should get same addresses with same salt", async () => {
    expect(
      await factory.predictWalletAddress(
        hre.ethers.utils.formatBytes32String("0")
      )
    ).to.equal(walletAddress);
  });

  it("PredictWalletAddress: Should get different addresses with different salt", async () => {
    expect(
      await factory.predictWalletAddress(
        hre.ethers.utils.formatBytes32String("1")
      )
    ).not.to.equal(walletAddress);
  });

  it("BatchTansferFrom: Should send tow tokens at a same time", async () => {
    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("1"),
      false
    );

    let tokens = [1, 2];

    await factory
      .connect(user1)
      .batchTransferFrom(user1.address, user2.address, tokens);

    let secondWalletAddress = await factory.walletOf(tokens[1]);

    expect(await factory.balanceOf(user1.address)).to.equal(0);
    expect(await factory.balanceOf(user2.address)).to.equal(2);
    expect(await factory.ownerOf(tokens[0])).to.equal(user2.address);
    expect(await factory.ownerOf(tokens[1])).to.equal(user2.address);
    expect(await factory.walletOwnerOf(walletAddress)).to.equal(user2.address);
    expect(await factory.walletOwnerOf(secondWalletAddress)).to.equal(
      user2.address
    );
  });
});
