const { expect } = require("chai");

describe("A3SWallet Contract", () => {
  // Wallet Conract Infos
  let A3SWallet;
  let a3sWallet;
  let provider;
  let owner, user1, user2, users;

  beforeEach(async () => {
    provider = waffle.provider;
    [owner, user1, user2, ...users] = await ethers.getSigners();
    A3SWallet = await hre.ethers.getContractFactory("A3SWallet");
    a3sWallet = await A3SWallet.deploy();
  });
});
