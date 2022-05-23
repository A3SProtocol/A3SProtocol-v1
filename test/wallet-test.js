const { expect } = require("chai");

describe("Wallet Contract", () => {
  // Wallet Conract Infos
  let Wallet;
  let wallet;

  // Test ERC20 Token Conract Infos
  let TestToken;
  let testToken;

  // Test ERC721 Token Conract Infos
  let TestNFT;
  let testNFT;
  let nftId;

  // Account Infos
  let provider;
  let owner;
  let user1;
  let user2;
  let users;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2, ...users] = await ethers.getSigners();
    Wallet = await hre.ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy(user1.address);

    TestToken = await hre.ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy();
    await testToken.mint(wallet.address, 100);

    TestNFT = await hre.ethers.getContractFactory("TestNFT");
    testNFT = await TestNFT.deploy();
    await testNFT.safeMint(wallet.address);
    nftId = 1;
  });

  it("Deployment: Can Deploy Wallet Contract", async () => {
    expect(wallet.address).to.have.length.above(0);
    expect(await wallet.owner()).to.equal(owner.address);
  });

  it("Ehter: Can Receive Ether", async () => {
    await owner.sendTransaction({
      to: wallet.address,
      value: hre.ethers.utils.parseEther("1.0"),
    });
    expect(await provider.getBalance(wallet.address)).to.equal(
      hre.ethers.utils.parseEther("1.0")
    );
  });

  it("Ehter: Can Send Ether", async () => {
    await owner.sendTransaction({
      to: wallet.address,
      value: hre.ethers.utils.parseEther("1.0"),
    });

    await wallet
      .connect(user1)
      .transferEther(user2.address, hre.ethers.utils.parseEther("0.5"));

    expect(await provider.getBalance(wallet.address)).to.equal(
      hre.ethers.utils.parseEther("0.5")
    );

    expect(await provider.getBalance(user2.address)).to.equal(
      hre.ethers.utils.parseEther("10000.5") // default every user contain 10000 ehter
    );
  });

  it("Ehter: Failed to Send Ether (only wallet owner)", async () => {
    await owner.sendTransaction({
      to: wallet.address,
      value: hre.ethers.utils.parseEther("1.0"),
    });

    try {
      await wallet.transferEther(
        user2.address,
        hre.ethers.utils.parseEther("0.5")
      );
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("ERC20: Can Transfer ERC20 Token", async () => {
    await wallet
      .connect(user1)
      .transferERC20(testToken.address, user2.address, 50);

    expect(await testToken.balanceOf(wallet.address)).to.equal(50);
    expect(await testToken.balanceOf(user2.address)).to.equal(50);
  });

  it("ERC20: Failed to Transfer ERC20 Token (only wallet owner)", async () => {
    try {
      await wallet.transferERC20(testToken.address, user2.address, 50);

      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("ERC20: Can Approve ERC20 Token", async () => {
    await wallet
      .connect(user1)
      .approveERC20(testToken.address, user2.address, 100);

    expect(await testToken.allowance(wallet.address, user2.address)).to.equal(
      100
    );
  });

  it("ERC20: Failed to Approve ERC20 Token (only wallet owner)", async () => {
    try {
      await wallet.approveERC20(testToken.address, user2.address, 100);

      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("ERC20: Can TransferFrom ERC20 Token", async () => {
    await testToken.mint(user2.address, 100);
    testToken.connect(user2).approve(wallet.address, 100);

    await wallet
      .connect(user1)
      .transferFromERC20(testToken.address, user2.address, 100);

    expect(await testToken.balanceOf(wallet.address)).to.equal(200);
  });

  it("ERC20: Failed to TransferFrom ERC20 Token (only wallet owner)", async () => {
    try {
      await testToken.mint(user2.address, 100);
      testToken.connect(user2).approve(wallet.address, 100);

      await wallet.transferFromERC20(testToken.address, user2.address, 100);

      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("ERC721: Can Approve ERC721 Token", async () => {
    await wallet
      .connect(user1)
      .approveERC721(testNFT.address, user2.address, nftId);

    expect(await testNFT.getApproved(nftId)).to.equal(user2.address);
  });

  it("ERC721: Failed to Approve ERC721 Token (only wallet owner)", async () => {
    try {
      await wallet.approveERC721(testNFT.address, user2.address, nftId);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("ERC721: Can SetApprovalForAll ERC721 Token", async () => {
    await wallet
      .connect(user1)
      .setApprovalForAllERC721(testNFT.address, user2.address, true);

    expect(
      await testNFT.isApprovedForAll(wallet.address, user2.address)
    ).to.equal(true);
  });

  it("ERC721: Failed to SetApprovalForAll ERC721 Token (only wallet owner)", async () => {
    try {
      await wallet.setApprovalForAllERC721(
        testNFT.address,
        user2.address,
        true
      );
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("ERC721: Can TransferFrom ERC721 Token Directly", async () => {
    await wallet
      .connect(user1)
      .transferFromERC721(
        testNFT.address,
        wallet.address,
        user2.address,
        nftId
      );

    expect(await testNFT.ownerOf(nftId)).to.equal(user2.address);
  });

  it("ERC721: Failed to TransferFrom ERC721 Token Directly (only wallet owner)", async () => {
    try {
      await wallet.transferFromERC721(
        testNFT.address,
        wallet.address,
        user2.address,
        nftId
      );
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("ERC721: Can TransferFrom ERC721 Token from other", async () => {
    await testNFT.safeMint(user2.address);
    let tmpNftId = 2;

    await testNFT.connect(user2).approve(wallet.address, tmpNftId);

    await wallet
      .connect(user1)
      .transferFromERC721(
        testNFT.address,
        user2.address,
        wallet.address,
        tmpNftId
      );

    expect(await testNFT.ownerOf(tmpNftId)).to.equal(wallet.address);
  });

  it("ERC721: Failed to TransferFrom ERC721 Token from other (only wallet owner)", async () => {
    try {
      await testNFT.safeMint(user2.address);
      let tmpNftId = 2;

      await testNFT.connect(user2).approve(wallet.address, tmpNftId);

      await wallet.transferFromERC721(
        testNFT.address,
        user2.address,
        wallet.address,
        tmpNftId
      );
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not wallet owner");
    }
  });

  it("WalletOwner: Can ChangeWalletOwner", async () => {
    await wallet.changeWalletOwner(user2.address);
    expect(await wallet.walletOwner()).to.equal(user2.address);
  });

  it("WalletOwner: Failed to ChangeWalletOwner (only owner)", async () => {
    try {
      await wallet.connect(user1).changeWalletOwner(user2.address);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not owner");
    }
  });
});
