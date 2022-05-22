const { expect } = require("chai");
const { ethers, waffle, web3 } = require("hardhat");

describe("Wallet Contract", () => {
  let Wallet;
  let wallet;
  let provider;
  let owner;
  let user1;
  let user2;
  let users;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2, ...users] = await ethers.getSigners();
    Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy(user1.address);
  });

  it("Deployment: Can Deploy Wallet Contract", async () => {
    expect(wallet.address).to.have.length.above(0);
    expect(await wallet.owner()).to.equal(owner.address);
  });

  it("Ehter: Can Receive Ether", async () => {
    // await owner.sendTransaction({
    //   to: wallet.address,
    //   value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    // });
    // console.log(await web3.eth.getBalance(wallet.address));
    // console.log(await web3.utils.toWei("1", "ether"));
    // expect(await provider.getBalance(wallet.address)).to.equal(
    //   await web3.utils.toWei("1", "ether")
    // );
  });

  it("Ehter: Can Send Ether", async () => {});

  it("Ehter: Failed to Send Ether (only wallet owner)", async () => {});

  it("ERC20: Can Approve ERC20 Token", () => {});

  it("ERC20: Failed to Approve ERC20 Token (only wallet owner)", () => {});

  it("ERC20: Can Transfer ERC20 Token", () => {});

  it("ERC20: Failed to Transfer ERC20 Token (only wallet owner)", () => {});

  it("ERC20: Can TransferFrom ERC20 Token", () => {});

  it("ERC20: Failed to TransferFrom ERC20 Token (only wallet owner)", () => {});

  it("ERC721: Can Approve ERC721 Token", () => {});

  it("ERC721: Failed to Approve ERC721 Token (only wallet owner)", () => {});

  it("ERC721: Can SetApprovalForAll ERC721 Token", () => {});

  it("ERC721: Failed to SetApprovalForAll ERC721 Token (only wallet owner)", () => {});

  it("ERC721: Can TransferFrom ERC721 Token", () => {});

  it("ERC721: Failed to TransferFrom ERC721 Token (only wallet owner)", () => {});

  it("WalletOwner: Can ChangeWalletOwner", () => {});

  it("WalletOwner: Failed to ChangeWalletOwner (only owner)", () => {});

  // it("Should return the new greeting once it's changed", async function () {
  //   const Greeter = await ethers.getContractFactory("Greeter");
  //   const greeter = await Greeter.deploy("Hello, world!");
  //   await greeter.deployed();

  //   expect(await greeter.greet()).to.equal("Hello, world!");

  //   const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

  //   // wait until the transaction is mined
  //   await setGreetingTx.wait();

  //   expect(await greeter.greet()).to.equal("Hola, mundo!");
  // });
});
