# A3SProtocol

This repository contains A3SWalletFactory and A3SWallet smart contracts.

## A3SWalletFactory

## A3SWallet

Our wallet provide two main functions, transferEther and generalCall.

```
contract A3SWallet {
    ...
    transferEther(address to, uint256 amount )

    generalCall(address contractAddress, bytes memory payload)
    ...
}
```

### transferEther

Responsible for handling wallet transfers or withdrawals.

### generalCall

Responsible for handling interactions with any other contract, the user must provide the target contract address and the corresponding function abi.

The contract functino abi can be calculated by [web3.eth.abi.encodeFunctionCall](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall) from [web3js](https://github.com/ChainSafe/web3.js)

Example:

```
    // ERC20 transfer funcion abi example
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
      [address, "20"]
    );
```

## Follow us

- [Website](https://www.a3sprotocol.xyz/)
- [Twitter](https://twitter.com/A3SProtocol)
- [Discord](https://discord.gg/uhYdwgA7Vj)
- [Medium](https://medium.com/@A3S_Protocol)
