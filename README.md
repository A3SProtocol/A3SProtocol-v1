# A3SProtocol

This repository contains A3SWalletFactory and A3SWallet smart contracts.

## A3SWalletFactory

A3SWalletFactory is adjusted based on [OpenZeppelin's ERC721](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721) implementation. We provide the mintWallet function so that users can create a tradable A3SWallet contract address through this function.

### **_mintWallet(address to,bytes32 salt,bool useFiatToken)_**

> Parameters
>
> ```
>   to: the address you want to assign the minted wallet to
>   salt: 32 bytes of input to determine the generated wallet address, each salt can only be used once
>   useFiatToken: if true, we will charge specified token as fee, else we will charge ether as fee
> ```

---

## A3SWallet

A3SWallet provide two main functions, transferEther and generalCall.

### **_transferEther(address to, uint256 amount)_**

> Responsible for handling wallet transfers or withdrawals.
>
> Parameters
>
> ```
>   to: recipient address, you can withdraw ethers with given your target wallet address
>   amount: number of ethers you want to transfer out from current wallet
> ```

### **_generalCall(address contractAddress, bytes payload)_**

> Responsible for handling interactions with any other contract, the user must provide the target contract address and the corresponding function payload.
>
> Parameters
>
> ```
>   contractAddress: target address you want to interact with
>   payload: encoded functino call with parameters and basic infos
> ```
>
> The contract functino payload can be calculated by [web3.eth.abi.encodeFunctionCall](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall) from [web3js](https://github.com/ChainSafe/web3.js)
>
> Example:
>
> ```
>   // ERC20 transfer funcion abi example
> let payload = await hre.web3.eth.abi.encodeFunctionCall(
>   {
>       name: "transfer",
>       type: "function",
>       inputs: [
>           {
>               type: "address",
>               name: "to",
>           },
>           {
>               type: "uint256",
>               name: "amount",
>           },
>       ],
>       outputs: [
>           {
>               type: "bool",
>               name: "nopr",
>           },
>       ],
>   },
>   [address, "20"]
> );
> ```

## Follow us

- [Website](https://www.a3sprotocol.xyz/)
- [Twitter](https://twitter.com/A3SProtocol)
- [Discord](https://discord.gg/uhYdwgA7Vj)
- [Medium](https://medium.com/@A3S_Protocol)
