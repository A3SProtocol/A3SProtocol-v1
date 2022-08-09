const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
var SHA3 = require("crypto-js/sha3");
const deployHelper = require("./utils/deplotHelper");

describe("A3SWalletFactory Contract", () => {
  let wlletHelper, factory, whitelist;
  let provider;
  let Deployer, User1, User2;

  const getProof = async () => {
    const leaves = [
      hre.ethers.utils.solidityPack(
        ["address", "string"],
        [Deployer.address, ""]
      ),
      hre.ethers.utils.solidityPack(["address", "string"], [User1.address, ""]),
      hre.ethers.utils.solidityPack(
        ["address", "string"],
        [User1.address, "free"]
      ),
      hre.ethers.utils.solidityPack(["address", "string"], [User2.address, ""]),
    ].map((x) => keccak256(x));
    leaves.sort();
    const tree = new MerkleTree(leaves, keccak256);
    const root = tree.getHexRoot();
    const leaf = keccak256(User1.address);
    const proof = tree.getHexProof(leaf);

    return [proof, root, tree];
  };

  beforeEach(async () => {
    provider = waffle.provider;
    [Deployer, User1, User2] = await ethers.getSigners();

    erc20 = await deployHelper.deployErc20();
    whitelist = await deployHelper.deployMerkleWhitelist();
    wlletHelper = await deployHelper.deployWalletHelper();
    factory = await deployHelper.deployWalletFactory();

    await deployHelper.connectFactoryAndWhitelist();

    factory = await deployHelper.upgradeWalletFactoryV2();
  });

  it("RootHash: Can update root hash from Deployer", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");
    await whitelist.updateRootHash(tmpRootHash);

    expect(await whitelist.rootHash()).to.equal(tmpRootHash);
  });

  it("RootHash: Can update root hash from executor", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");

    await whitelist.updateExecutor(User2.address);
    await whitelist.updateRootHash(tmpRootHash);

    expect(await whitelist.connect(User2).rootHash()).to.equal(tmpRootHash);
  });

  it("RootHash: Should failed to update root hash", async () => {
    const tmpRootHash = await hre.ethers.utils.formatBytes32String("test");

    try {
      await whitelist.connect(User1).updateRootHash(tmpRootHash);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not Executor or Owner");
    }
  });

  it("IsLimited: Can update isLimited", async () => {
    await whitelist.updateIsLimited(true);
    expect(await whitelist.isLimited()).to.equal(true);
  });

  it("IsLimited: Should failed to update isLimited", async () => {
    await expect(whitelist.connect(User1).updateIsLimited(true)).revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("IsMintable: Should return 0 if is limited and is not in whitelist ", async () => {
    await whitelist.updateIsLimited(true);
    const approvalCode = "";
    const [proof, root] = await getProof();

    expect(
      await whitelist.isMintable(Deployer.address, approvalCode, proof)
    ).to.equal(0);
  });

  it("IsMintable: Should return 1 if is limited, is in whitelist, and is claimed", async () => {
    await whitelist.updateIsLimited(true);

    const [proof, root] = await getProof();
    await whitelist.updateRootHash(root);

    await factory
      .connect(User1)
      .mintWallet(
        User1.address,
        hre.ethers.utils.formatBytes32String(""),
        "",
        false,
        proof
      );

    expect(await whitelist.isMintable(User1.address, "", proof)).to.equal(1);
  });

  it("IsMintable: Should return 2 if is limited, is in whitelist, and is not claimed", async () => {
    await whitelist.updateIsLimited(true);

    const [proof, root] = await getProof();
    await whitelist.updateRootHash(root);

    expect(await whitelist.isMintable(User1.address, "", proof)).to.equal(2);
  });

  it("IsMintable: Should return 2 if is limited, is in whitelist, and is not claimed with given valid ticket", async () => {
    await whitelist.updateIsLimited(true);

    const [_, root, tree] = await getProof();

    const leaf = keccak256(
      hre.ethers.utils.solidityPack(
        ["address", "string"],
        [User1.address, "free"]
      )
    );
    const proof = tree.getHexProof(leaf);

    await whitelist.updateRootHash(root);

    expect(await whitelist.isMintable(User1.address, "free", proof)).to.equal(
      2
    );
  });

  it("IsMintable: Should return 3 if is not limited", async () => {
    const proof = [hre.ethers.utils.formatBytes32String("")];
    expect(await whitelist.isMintable(Deployer.address, "", proof)).to.equal(3);
  });

  it("ClaimWhitelist: Should failed if caller is not factory", async () => {
    await whitelist.updateIsLimited(true);

    const [proof, root] = await getProof();

    try {
      await whitelist.claimWhitelist(User1.address, "", proof);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Invalid Caller");
    }
  });
});
