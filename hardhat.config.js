require("dotenv").config();

require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    goerli: {
      url: "https://eth-goerli.alchemyapi.io/v2/Dkm15Z-ZHOeDzTsWU-8Z06WNBgTAjRsz",
      accounts: [
        "0xef328e2a085f9fb13fdd6dc6bfa48b6aa5d5b262d4aacf84fed801763a4ab610",
      ],
    },
    ganache_test: {
      url: "HTTP://127.0.0.1:7545",
      chainId: 1337,
      gas: 10000000000,
      accounts: "remote",
    },
  },
  gasReporter: {
    // enabled: process.env.REPORT_GAS !== undefined,
    // currency: "USD",
  },
  etherscan: {
    apiKey: "C7XMXYEDUQ2K4797E7UZPHKYZSVF37XA9M",
  },
  // contractSizer: {
  //   alphaSort: true,
  //   disambiguatePaths: false,
  //   runOnCompile: true,
  //   strict: true,
  // },
};
