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

  it("Deployment: Should Deploy Wallet Contract", async () => {
    expect(wallet.address).to.have.length.above(0);
    expect(await wallet.owner()).to.equal(owner.address);
  });

  it("Ehter: Can receive ether", async () => {
    await owner.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });

    console.log(await web3.eth.getBalance(wallet.address));
    console.log(await web3.utils.toWei("1", "ether"));

    expect(await provider.getBalance(wallet.address)).to.equal(
      await web3.utils.toWei("1", "ether")
    );
  });

  it("ERC20", () => {});

  it("ERC721", () => {});

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
