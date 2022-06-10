const { expect } = require("chai");

describe("A3SWallet Contract", () => {
  let A3SWalletFactory;
  let factory;
  let tokenId;
  let walletAddress;
  let wallet;
  let Erc20Token;
  let erc20Token;
  let provider;
  let owner, user1, user2;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2] = await ethers.getSigners();
    A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");
    factory = await upgrades.deployProxy(A3SWalletFactory, ["ipfs:/"]);

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
      expect(e.message).includes("Caller is not owner");
    }
  });

  it("GeneralCall: Can call General Call", async () => {
    let contractAdress = await erc20Token.address;
    let payload = await hre.web3.eth.abi.encodeFunctionCall(
      {
        name: "transfer",
        type: "function",
        inputs: [
          {
            type: "address",
            name: "to",
          },
          {
            type: "uint256",
            name: "amount",
          },
        ],
        outputs: [
          {
            type: "bool",
            name: "nopr",
          },
        ],
      },
      [user2.address, "20"]
    );

    await wallet.connect(user1).generalCall(contractAdress, payload);

    expect(await erc20Token.balanceOf(wallet.address)).to.equal(80);
    expect(await erc20Token.balanceOf(user2.address)).to.equal(20);
  });

  it("GeneralCall: Should failed (call by non-owner)", async () => {
    try {
      let contractAdress = await erc20Token.address;
      let payload = await hre.web3.eth.abi.encodeFunctionCall(
        {
          name: "transfer",
          type: "function",
          inputs: [
            {
              type: "address",
              name: "to",
            },
            {
              type: "uint256",
              name: "amount",
            },
          ],
          outputs: [
            {
              type: "bool",
              name: "nopr",
            },
          ],
        },
        [user2.address, "20"]
      );

      await wallet.generalCall(contractAdress, payload);
      throw new Error("Dose not throw Error");
    } catch (e) {
      expect(e.message).includes("Caller is not owner");
    }
  });
});
