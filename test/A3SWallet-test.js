const { expect } = require("chai");

describe("A3SWallet Contract", () => {
  let A3SWalletFactory;
  let factory;
  let tokenId;
  let walletAddress;
  let wallet;
  let provider;
  let owner, user1, user2;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2] = await ethers.getSigners();
    A3SWalletFactory = await hre.ethers.getContractFactory("A3SWalletFactory");
    factory = await A3SWalletFactory.deploy("A3SProtocol", "A3S");

    await factory.mintWallet(
      user1.address,
      hre.ethers.utils.formatBytes32String("0")
    );

    tokenId = 1;
    walletAddress = await factory.walletOf(tokenId);

    wallet = await hre.ethers.getContractAt("A3SWallet", walletAddress);
  });

  it("Deployment: Can Deploy A3SWallet Contract", async () => {
    expect(wallet.address).to.have.length.above(0);
    expect(await wallet.factory()).to.equal(factory.address);
    expect(await wallet.ownerOf()).to.equal(user1.address);
  });

  it("GeneralCall: Can call General Call", async () => {
    //factory.walletOwnerOf
    let contractAdress = factory.address;
    let payload = hre.web3.eth.abi.encodeFunctionCall(
      {
        name: "walletOwnerOf",
        type: "function",
        inputs: [
          {
            type: "address",
            name: "wallet",
          },
        ],
      },
      [wallet.address]
    );

    const result = await wallet.connect(1).generalCall(contractAdress, payload);

    console.log(result);
  });

  it("GeneralCall: Should failed (call by non-owner)", async () => {});
});
