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

    await factory.mintWallet(
      User1.address,
      hre.ethers.utils.formatBytes32String("0"),
      "",
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    tokenId = 1;
    walletAddress = await factory.walletOf(tokenId);

    await erc20.mint(factory.address, 100);
  });

  it("Deployment: Can Deploy A3SWalletFactory Contract", async () => {
    expect(factory.address).to.have.length.above(0);
    expect(await factory.name()).to.equal("A3SProtocol");
    expect(await factory.symbol()).to.equal("A3S");
  });

  it("MintWallet: ", async () => {
    await factory.mintWallet(
      User1.address,
      hre.ethers.utils.formatBytes32String("1"),
      "",
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    await factory.mintWallet(
      User1.address,
      hre.ethers.utils.formatBytes32String("2"),
      "",
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );
  });

  it("BaseMetaURI: Can Update base meta uri", async () => {
    const newURI = "https://ipfs.io/ipfs/...";
    await factory.updateBaseMetaURI(newURI);

    expect(await factory.baseMetaURI()).to.equal(newURI);
  });

  // it("WithdrawEther: Can withdraw Ether", async () => {
  //   const amount = ethers.utils.parseEther("50.0");
  //   await User1.sendTransaction({
  //     to: factory.address,
  //     value: ethers.utils.parseEther("100.0"), // Sends exactly 1.0 ether
  //   });
  //   await factory.withdrawEther(amount);

  //   expect(await provider.getBalance(factory.address)).to.equal(amount);
  //   expect(await provider.getBalance(Deployer.address)).to.gte(
  //     ethers.utils.parseEther("10000.0")
  //   );
  //   expect(await provider.getBalance(Deployer.address)).to.lte(
  //     ethers.utils.parseEther("10050.0")
  //   );
  // });

  // it("WithdrawEther: ", async () => {
  //   const amount = ethers.utils.parseEther("50.0");
  //   await User1.sendTransaction({
  //     to: factory.address,
  //     value: ethers.utils.parseEther("100.0"), // Sends exactly 1.0 ether
  //   });

  //   try {
  //     await factory.connect(User1).withdrawEther(amount);
  //     throw new Error("Dose not throw Error");
  //   } catch (e) {
  //     expect(e.message).includes("Ownable: caller is not the owner");
  //   }
  // });

  // it("WithdrawToken:  Can withdraw Token", async () => {
  //   const amount = 50;
  //   await factory.updateFee(erc20.address, 0, 0);
  //   await factory.withdrawToken(amount);

  //   expect(await erc20.balanceOf(factory.address)).to.equal(50);
  //   expect(await erc20.balanceOf(Deployer.address)).to.equal(50);
  // });

  // it("WithdrawToken: Should failed to withdraw Token", async () => {
  //   const amount = 50;
  //   await factory.updateFee(erc20.address, 0, 0);
  //   try {
  //     await factory.connect(User1).withdrawToken(amount);
  //     throw new Error("Dose not throw Error");
  //   } catch (e) {
  //     expect(e.message).includes("Ownable: caller is not the owner");
  //   }
  // });

  it("BatchTansferFrom: Should send tow tokens at a same time", async () => {
    await factory.mintWallet(
      User1.address,
      hre.ethers.utils.formatBytes32String("1"),
      "",
      false,
      [hre.ethers.utils.formatBytes32String("")]
    );

    let tokens = [1, 2];

    await factory
      .connect(User1)
      .batchTransferFrom(User1.address, User2.address, tokens);

    let secondWalletAddress = await factory.walletOf(tokens[1]);

    expect(await factory.balanceOf(User1.address)).to.equal(0);
    expect(await factory.balanceOf(User2.address)).to.equal(2);
    expect(await factory.ownerOf(tokens[0])).to.equal(User2.address);
    expect(await factory.ownerOf(tokens[1])).to.equal(User2.address);
    expect(await factory.walletOwnerOf(walletAddress)).to.equal(User2.address);
    expect(await factory.walletOwnerOf(secondWalletAddress)).to.equal(
      User2.address
    );
  });

  it("PredictWalletAddress: Should get same addresses with same salt", async () => {
    expect(
      await factory.predictWalletAddress(
        hre.ethers.utils.formatBytes32String("0")
      )
    ).to.equal(walletAddress);
  });

  it("PredictWalletAddress: Should get same wallet address with same salt", async () => {
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
    ).to.not.equal(walletAddress);
  });
});
