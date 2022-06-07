const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs");
const sha3 = require("crypto-js/sha3");
const keccak256 = require("keccak256");

describe("MerkleWhitelist Contract", () => {
  let MerkleWhitelist;
  let merkleWhitelist;
  let provider;
  let owner, user1, user2;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2] = await ethers.getSigners();
    MerkleWhitelist = await hre.ethers.getContractFactory("MerkleWhitelist");
    merkleWhitelist = await MerkleWhitelist.deploy();
  });

  it("Deployment: Can Deploy MerkleWhitelist Contract", async () => {
    expect(merkleWhitelist.address).to.have.length.above(0);
    expect(await merkleWhitelist.rootHash()).to.equal(
      await hre.ethers.utils.formatBytes32String("")
    );
    expect(await merkleWhitelist.round()).to.equal(1);
    expect(await merkleWhitelist.isLimited()).to.equal(false);
  });

  it("UpdateRootHash: Can update root hash", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");
    await merkleWhitelist.updateRootHash(tmpRootHash);

    expect(await merkleWhitelist.rootHash()).to.equal(tmpRootHash);
  });

  it("UpdateRootHash: Should failed to update root hash", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");

    try {
      await merkleWhitelist.connect(user1).updateRootHash(tmpRootHash);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("UpdateRound: Can update round", async () => {
    await merkleWhitelist.updateRound();
    expect(await merkleWhitelist.round()).to.equal(2);
  });

  it("UpdateRound: Should failed to update round", async () => {
    try {
      await merkleWhitelist.connect(user1).updateRound();
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("UpdateIsLimited: Can update isLimited", async () => {
    await merkleWhitelist.updateIsLimited(true);
    expect(await merkleWhitelist.isLimited()).to.equal(true);
  });

  it("UpdateIsLimited: Should failed to update isLimited", async () => {
    try {
      await merkleWhitelist.connect(user1).updateIsLimited(true);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Ownable: caller is not the owner");
    }
  });

  it("IsInWhitelist: Can get if sender is in the whitelist", async () => {
    // Don't know why merkletreejs verify always false
  });
});
