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
    await erc20Token.mint(factory.address, 100);
  });

  it("Deployment: Can Deploy A3SWalletFactory Contract", async () => {
    expect(factory.address).to.have.length.above(0);
    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
  });

  it("BaseMetaURI: Can Update base meta uri", async () => {
    const newURI = "https://ipfs.io/ipfs/...";
    await factory.updateBaseMetaURI(newURI);

    expect(await factory.baseMetaURI()).to.equal(newURI);
  });

  it("WithdrawEther: Can withdraw Ether", async () => {
    const amount = ethers.utils.parseEther("50.0");
    await user1.sendTransaction({
      to: factory.address,
      value: ethers.utils.parseEther("100.0"), // Sends exactly 1.0 ether
    });
    await factory.withdrawEther(amount);

    expect(await provider.getBalance(factory.address)).to.equal(amount);
    expect(await provider.getBalance(owner.address)).to.gte(
      ethers.utils.parseEther("10000.0")
    );
    expect(await provider.getBalance(owner.address)).to.lte(
      ethers.utils.parseEther("10050.0")
    );
  });

  it("WithdrawEther: ", async () => {
    const amount = ethers.utils.parseEther("50.0");
    await user1.sendTransaction({
      to: factory.address,
      value: ethers.utils.parseEther("100.0"), // Sends exactly 1.0 ether
    });

    try {
      await factory.connect(user1).withdrawEther(amount);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("WithdrawToken:  Can withdraw Token", async () => {
    const amount = 50;
    await factory.updateFiatToken(erc20Token.address);
    await factory.withdrawToken(amount);

    expect(await erc20Token.balanceOf(factory.address)).to.equal(50);
    expect(await erc20Token.balanceOf(owner.address)).to.equal(50);
  });

  it("WithdrawToken: Should failed to withdraw Token", async () => {
    const amount = 50;
    await factory.updateFiatToken(erc20Token.address);
    try {
      await factory.connect(user1).withdrawToken(amount);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
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
