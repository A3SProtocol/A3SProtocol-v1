const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
var SHA3 = require("crypto-js/sha3");

describe("A3SWalletFactory Contract", () => {
  let A3SWalletFactory;
  let factory;
  let owner, user1, user2;

  beforeEach(async () => {
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
  });

  it("RootHash: Can update root hash", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");
    await factory.updateRootHash(tmpRootHash);

    expect(await factory.rootHash()).to.equal(tmpRootHash);
  });

  it("RootHash: Should failed to update root hash", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");

    try {
      await factory.connect(user1).updateRootHash(tmpRootHash);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("Round: Can update round", async () => {
    await factory.updateRound();
    expect(await factory.round()).to.equal(1);
  });

  it("Round: Should failed to update round", async () => {
    try {
      await factory.connect(user1).updateRound();
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("IsLimited: Can update isLimited", async () => {
    await factory.updateIsLimited(true);
    expect(await factory.isLimited()).to.equal(true);
  });

  it("IsLimited: Should failed to update isLimited", async () => {
    try {
      await factory.connect(user1).updateIsLimited(true);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("IsPaused: Can update isPaused", async () => {
    await factory.updateIsPuased(true);
    expect(await factory.isPaused()).to.equal(true);
  });

  it("IsPaused: Should failed to update isPaused", async () => {
    try {
      await factory.connect(user1).updateIsPuased(true);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("IsMintable: Should return 0 if is paused", async () => {
    await factory.updateIsPuased(true);
    const proof = [hre.ethers.utils.formatBytes32String("")];

    expect(await factory.isMintable(owner.address, proof)).to.equal(0);
  });

  it("IsMintable: Should return 2 if is not paused and is not limited", async () => {
    const proof = [hre.ethers.utils.formatBytes32String("")];
    expect(await factory.isMintable(owner.address, proof)).to.equal(2);
  });

  it("IsMintable: Should return 0 if is not paused, is limited and is not in whitelist ", async () => {
    await factory.updateIsLimited(true);
    const proof = [hre.ethers.utils.formatBytes32String("")];

    expect(await factory.isMintable(owner.address, proof)).to.equal(0);
  });

  it("IsMintable: Should return 0 if is not paused, is limited, is in whitelist, and is claimed", async () => {
    await factory.updateIsLimited(true);

    const leaves = [owner.address, user1.address, user2.address].map((x) =>
      keccak256(x)
    );
    const tree = new MerkleTree(leaves, keccak256);
    const root = tree.getHexRoot();
    const leaf = keccak256(user1.address);
    const proof = tree.getHexProof(leaf);

    await factory.updateRootHash(root);
    expect(await factory.isMintable(owner.address, proof)).to.equal(0);
  });

  it("IsMintable: Should return 1 if is paused, is limited, is in whitelist, and is not claimed", async () => {
    await factory.updateIsLimited(true);
    await factory.updateRound();

    const leaves = [owner.address, user1.address, user2.address].map((x) =>
      keccak256(x)
    );
    leaves.sort();

    const tree = new MerkleTree(leaves, keccak256);
    const root = tree.getHexRoot();
    const leaf = keccak256(user1.address);
    const proof = tree.getHexProof(leaf);

    await factory.updateRootHash(root);
    expect(await factory.isMintable(user1.address, proof)).to.equal(1);
  });
});
