const { expect } = require("chai");
const TestTokenJson = require("../artifacts/contracts/test/TestToken.sol/TestToken.json");

describe("A3SWallet Contract", () => {
  let A3SWalletFactory, factory;
  let A3SWalletHelper, wlletHelper;
  let MerkleWhitelist, whitelist;
  let Erc20Token, erc20Token;
  let tokenId, walletAddress, wallet;
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
    wallet = await hre.ethers.getContractAt("A3SWallet", walletAddress);

    Erc20Token = await hre.ethers.getContractFactory("TestToken");
    erc20Token = await Erc20Token.deploy();
    await erc20Token.mint(wallet.address, 100);
  });

  it("Deployment: Can Deploy A3SWallet Contract", async () => {
    expect(wallet.address).to.have.length.above(0);
    expect(await wallet.factory()).to.equal(factory.address);
    expect(await wallet.ownerOf()).to.equal(user1.address);
  });

  it("GeneralCall: Can Send Ether", async () => {
    await owner.sendTransaction({
      to: wallet.address,
      value: hre.ethers.utils.parseEther("1.0"),
    });

    await wallet
      .connect(user1)
      .generalCall(user2.address, "0x00", hre.ethers.utils.parseEther("0.5"));

    expect(await provider.getBalance(wallet.address)).to.equal(
      hre.ethers.utils.parseEther("0.5")
    );

    expect(await provider.getBalance(user2.address)).to.equal(
      hre.ethers.utils.parseEther("10000.5") // default every user contain 10000 ehter
    );
  });

  it("GeneralCall: Failed to Send Ether (only wallet owner)", async () => {
    await owner.sendTransaction({
      to: wallet.address,
      value: hre.ethers.utils.parseEther("1.0"),
    });

    try {
      await wallet.generalCall(
        user2.address,
        "0x00",
        hre.ethers.utils.parseEther("0.5")
      );

      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not owner");
    }
  });

  it("GeneralCall: Can call General Call", async () => {
    let contractAddress = await erc20Token.address;

    let abi = TestTokenJson.abi[16];
    let parameters = [user2.address, "20"];
    let payload = await hre.web3.eth.abi.encodeFunctionCall(abi, parameters);

    await wallet
      .connect(user1)
      .generalCall(contractAddress, payload, hre.ethers.utils.parseEther("0"));

    expect(await erc20Token.balanceOf(wallet.address)).to.equal(80);
    expect(await erc20Token.balanceOf(user2.address)).to.equal(20);
  });

  it("GeneralCall: Should failed (call by non-owner)", async () => {
    try {
      let contractAdress = await erc20Token.address;

      let abi = TestTokenJson.abi[16];
      let parameters = [user2.address, "20"];
      let payload = await hre.web3.eth.abi.encodeFunctionCall(abi, parameters);

      await wallet.generalCall(contractAdress, payload, 0);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not owner");
    }
  });
});
