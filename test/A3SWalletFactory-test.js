const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory;
  let factory;
  let tokenId;
  let walletAddress;
  let provider;
  let Erc20Token;
  let erc20Token;
  let owner, user1, user2;

  beforeEach(async () => {
    provider = waffle.provider;
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

    tokenId = 1;
    walletAddress = await factory.walletOf(tokenId);

    Erc20Token = await hre.ethers.getContractFactory("TestToken");
    erc20Token = await Erc20Token.deploy();
    await erc20Token.mint(owner.address, 100);
  });

  it("Deployment: Can Deploy A3SWalletFactory Contract", async () => {
    expect(factory.address).to.have.length.above(0);
    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
  });

  it("Upgrade: Can upgrade contract with keeping old state", async () => {
    const A3SWalletFactoryV2 = await ethers.getContractFactory(
      "A3SWalletFactoryV2"
    );
    const factoryV2 = await upgrades.upgradeProxy(
      factory.address,
      A3SWalletFactoryV2
    );

    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
    expect(await factory.balanceOf(user1.address)).to.equal(1);
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

  it("MintWallet: Can Mint a New Wallet with ether fee", async () => {
    await factory.updateEtherFee(1);
    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("1"),
      false,
      [hre.ethers.utils.formatBytes32String("")],
      { value: ethers.utils.parseEther("2.0") }
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

  it("MintWallet: Can Mint a New Wallet with fiat token fee", async () => {
    await factory.updateFiatToken(erc20Token.address);
    await factory.updateFiatTokenFee(10);
    await erc20Token.approve(factory.address, 50);

    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("1"),
      true,
      [hre.ethers.utils.formatBytes32String("")]
    );

    let secondTokenId = 2;
    let secondWalletAddress = await factory.walletOf(secondTokenId);

    expect(await erc20Token.balanceOf(factory.address)).to.equal(10);
    expect(await erc20Token.balanceOf(owner.address)).to.equal(90);

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
      false,
      [hre.ethers.utils.formatBytes32String("")]
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
