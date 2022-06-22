const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory, factory;
  let A3SWalletHelper, wlletHelper;
  let MerkleWhitelist, whitelist;
  let Erc20Token, erc20Token;
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

    Erc20Token = await hre.ethers.getContractFactory("TestToken");
    erc20Token = await Erc20Token.deploy();
    await erc20Token.mint(factory.address, 100);
  });

  it("Deployment: Can Deploy A3SWalletFactory Contract", async () => {
    expect(factory.address).to.have.length.above(0);
    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
  });

  it("MintWallet: ", async () => {
    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("1"),
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("2"),
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );
  });

  // it("BaseMetaURI: Can Update base meta uri", async () => {
  //   const newURI = "https://ipfs.io/ipfs/...";
  //   await factory.updateBaseMetaURI(newURI);

  //   expect(await factory.baseMetaURI()).to.equal(newURI);
  // });

  // it("WithdrawEther: Can withdraw Ether", async () => {
  //   const amount = ethers.utils.parseEther("50.0");
  //   await user1.sendTransaction({
  //     to: factory.address,
  //     value: ethers.utils.parseEther("100.0"), // Sends exactly 1.0 ether
  //   });
  //   await factory.withdrawEther(amount);

  //   expect(await provider.getBalance(factory.address)).to.equal(amount);
  //   expect(await provider.getBalance(owner.address)).to.gte(
  //     ethers.utils.parseEther("10000.0")
  //   );
  //   expect(await provider.getBalance(owner.address)).to.lte(
  //     ethers.utils.parseEther("10050.0")
  //   );
  // });

  // it("WithdrawEther: ", async () => {
  //   const amount = ethers.utils.parseEther("50.0");
  //   await user1.sendTransaction({
  //     to: factory.address,
  //     value: ethers.utils.parseEther("100.0"), // Sends exactly 1.0 ether
  //   });

  //   try {
  //     await factory.connect(user1).withdrawEther(amount);
  //     throw new Error("Dose not throw Error");
  //   } catch (e) {
  //     expect(e.message).includes("Ownable: caller is not the owner");
  //   }
  // });

  // it("WithdrawToken:  Can withdraw Token", async () => {
  //   const amount = 50;
  //   await factory.updateFee(erc20Token.address, 0, 0);
  //   await factory.withdrawToken(amount);

  //   expect(await erc20Token.balanceOf(factory.address)).to.equal(50);
  //   expect(await erc20Token.balanceOf(owner.address)).to.equal(50);
  // });

  // it("WithdrawToken: Should failed to withdraw Token", async () => {
  //   const amount = 50;
  //   await factory.updateFee(erc20Token.address, 0, 0);
  //   try {
  //     await factory.connect(user1).withdrawToken(amount);
  //     throw new Error("Dose not throw Error");
  //   } catch (e) {
  //     expect(e.message).includes("Ownable: caller is not the owner");
  //   }
  // });

  // it("BatchTansferFrom: Should send tow tokens at a same time", async () => {
  //   await factory.mintWallet(
  //     user1.address,
  //     hre.ethers.utils.formatBytes32String("1"),
  //     false,
  //     [hre.ethers.utils.formatBytes32String("")]
  //   );

  //   let tokens = [1, 2];

  //   await factory
  //     .connect(user1)
  //     .batchTransferFrom(user1.address, user2.address, tokens);

  //   let secondWalletAddress = await factory.walletOf(tokens[1]);

  //   expect(await factory.balanceOf(user1.address)).to.equal(0);
  //   expect(await factory.balanceOf(user2.address)).to.equal(2);
  //   expect(await factory.ownerOf(tokens[0])).to.equal(user2.address);
  //   expect(await factory.ownerOf(tokens[1])).to.equal(user2.address);
  //   expect(await factory.walletOwnerOf(walletAddress)).to.equal(user2.address);
  //   expect(await factory.walletOwnerOf(secondWalletAddress)).to.equal(
  //     user2.address
  //   );
  // });

  // it("PredictWalletAddress: Should get same addresses with same salt", async () => {
  //   expect(
  //     await factory.predictWalletAddress(
  //       hre.ethers.utils.formatBytes32String("0")
  //     )
  //   ).to.equal(walletAddress);
  // });

  // it("PredictWalletAddress: Should get same wallet address with same salt", async () => {
  //   expect(
  //     await factory.predictWalletAddress(
  //       hre.ethers.utils.formatBytes32String("0")
  //     )
  //   ).to.equal(walletAddress);
  // });

  // it("PredictWalletAddress: Should get different addresses with different salt", async () => {
  //   expect(
  //     await factory.predictWalletAddress(
  //       hre.ethers.utils.formatBytes32String("1")
  //     )
  //   ).to.not.equal(walletAddress);
  // });
});
