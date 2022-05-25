//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./Wallet.sol";
import "./IWallet.sol";

import "hardhat/console.sol";

contract WalletManager is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private idCounter;

    mapping(uint256 => address) private walletAddresses;
    mapping(address => address) private walletOwners;

    event MintWallet(address indexed _to, bytes32 _salt);

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    receive() external payable {}

    function mintWallet(address _to, bytes32 _salt) external {
        idCounter.increment();
        uint256 amount = 0;
        uint256 newTokenId = idCounter.current();
        bytes memory code = _getWalletBytecode(_to);

        address newAddr = Create2.deploy(amount, _salt, code);
        _mint(_to, newTokenId);

        walletAddresses[newTokenId] = newAddr;
        walletOwners[newAddr] = _to;

        emit MintWallet(_to, _salt);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._afterTokenTransfer(from, to, tokenId);
        if (from == address(0)) {
            // Create Wallet
        } else if (to == address(0)) {
            // Burn Wallet
        } else {
            // Transfer Wallet => Change Wallet Owner
            address targetWallet = walletAddresses[tokenId];
            IWallet(targetWallet).changeWalletOwner(to);
            walletOwners[targetWallet] = to;
        }
    }

    function _getWalletBytecode(address _to)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory bytecode = type(Wallet).creationCode;
        return abi.encodePacked(bytecode, abi.encode(address(_to))); // 不確定 abi.encode(address(this))
        // return bytecode;
    }

    function walletAddressWithSalt(bytes32 _salt, address _to)
        external
        view
        returns (address)
    {
        return
            Create2.computeAddress(_salt, keccak256(_getWalletBytecode(_to)));
    }

    // function ownerOfWallet() {}

    function walletAddressOf(uint256 _tokenId) external view returns (address) {
        return walletAddresses[_tokenId];
    }

    function walletOwnerOfWalletAddress(address _wallet)
        external
        view
        returns (address)
    {
        return walletOwners[_wallet];
    }
}
