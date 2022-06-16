const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
var SHA3 = require("crypto-js/sha3");

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
  });

  it("RootHash: Can update root hash from owner", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");
    await whitelist.updateRootHash(tmpRootHash);

    expect(await whitelist.rootHash()).to.equal(tmpRootHash);
  });

  it("RootHash: Can update root hash from executor", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");

    await whitelist.updateExecutor(user2.address);
    await whitelist.updateRootHash(tmpRootHash);

    expect(await whitelist.connect(user2).rootHash()).to.equal(tmpRootHash);
  });

  it("RootHash: Should failed to update root hash", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");

    try {
      await whitelist.connect(user1).updateRootHash(tmpRootHash);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not Executor or Owner");
    }
  });

  it("Round: Can update round", async () => {
    await whitelist.updateRound();
    expect(await whitelist.round()).to.equal(1);
  });

  it("Round: Should failed to update round", async () => {
    try {
      await whitelist.connect(user1).updateRound();
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("IsLimited: Can update isLimited", async () => {
    await whitelist.updateIsLimited(true);
    expect(await whitelist.isLimited()).to.equal(true);
  });

  it("IsLimited: Should failed to update isLimited", async () => {
    try {
      await whitelist.connect(user1).updateIsLimited(true);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("IsMintable: Should return 3 if is not limited", async () => {
    const proof = [hre.ethers.utils.formatBytes32String("")];
    expect(await whitelist.isMintable(owner.address, proof)).to.equal(3);
  });

  it("IsMintable: Should return 0 if is limited and is not in whitelist ", async () => {
    await whitelist.updateIsLimited(true);
    const proof = [hre.ethers.utils.formatBytes32String("")];

    expect(await whitelist.isMintable(owner.address, proof)).to.equal(0);
  });

  it("IsMintable: Should return 1 if is limited, is in whitelist, and is claimed", async () => {
    await whitelist.updateIsLimited(true);

    const leaves = [owner.address, user1.address, user2.address].map((x) =>
      keccak256(x)
    );
    leaves.sort();
    const tree = new MerkleTree(leaves, keccak256);
    const root = tree.getHexRoot();
    const leaf = keccak256(user1.address);
    const proof = tree.getHexProof(leaf);

    await whitelist.updateRootHash(root);
    expect(await whitelist.isMintable(user1.address, proof)).to.equal(1);
  });

  it("IsMintable: Should return 2 if is limited, is in whitelist, and is not claimed", async () => {
    await whitelist.updateIsLimited(true);
    await whitelist.updateRound();

    const leaves = [owner.address, user1.address, user2.address].map((x) =>
      keccak256(x)
    );
    leaves.sort();

    const tree = new MerkleTree(leaves, keccak256);
    const root = tree.getHexRoot();
    const leaf = keccak256(user1.address);
    const proof = tree.getHexProof(leaf);

    await whitelist.updateRootHash(root);
    expect(await whitelist.isMintable(user1.address, proof)).to.equal(2);
  });

  it("ClaimWhitelist: Should failed if caller is not factory", async () => {
    await whitelist.updateIsLimited(true);
    await whitelist.updateRound();

    const leaves = [owner.address, user1.address, user2.address].map((x) =>
      keccak256(x)
    );
    leaves.sort();

    const tree = new MerkleTree(leaves, keccak256);
    const root = tree.getHexRoot();
    const leaf = keccak256(user1.address);
    const proof = tree.getHexProof(leaf);

    try {
      await whitelist.claimWhitelist(user1.address, proof);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Invalid Caller");
    }
  });
});
