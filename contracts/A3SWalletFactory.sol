//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

import "./IA3SWalletFactory.sol";
import "./A3SWallet.sol";

import "hardhat/console.sol";

contract A3SWalletFactory is ERC721, IA3SWalletFactory {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private tokenIdCounter;

    // Mapping from token ID to wallet address
    mapping(uint256 => address) private _wallets;

    // Mapping from  wallet address to token ID
    mapping(address => uint256) private _walletsId;

    // Mapping from  wallet address to owner address
    mapping(address => address) private _walletsOwner;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    receive() external payable {}

    /**
     * @dev See {IA3SWalletFactory-mintWallet}.
     */
    function mintWallet(address to, bytes32 salt) external virtual override {
        tokenIdCounter.increment();
        uint256 amount = 0;
        uint256 newTokenId = tokenIdCounter.current();

        bytes memory walletByteCode = _walletBytecode();
        address newWallet = Create2.deploy(amount, salt, walletByteCode);

        _mint(to, newTokenId);

        _wallets[newTokenId] = newWallet;
        _walletsId[newWallet] = newTokenId;
        _walletsOwner[newWallet] = to;

        emit MintWallet(to, salt, newWallet, newTokenId);
    }

    /**
     * @dev See {IA3SWalletFactory-walletOf}.
     */
    function walletOf(uint256 tokenId)
        external
        view
        virtual
        override
        returns (address)
    {
        address wallet = _wallets[tokenId];
        require(
            wallet != address(0),
            "A3SProtocol: Wallet address query for nonexistent token"
        );
        return wallet;
    }

    /**
     * @dev See {IA3SWalletFactory-walletIdOf}.
     */
    function walletIdOf(address wallet)
        external
        view
        virtual
        override
        returns (uint256)
    {
        uint256 tokenId = _walletsId[wallet];
        require(
            tokenId != 0,
            "A3SProtocol: Token ID query for nonexistent wallet"
        );
        return tokenId;
    }

    /**
     * @dev See {IA3SWalletFactory-walletOwnerOf}.
     */
    function walletOwnerOf(address wallet)
        external
        view
        virtual
        override
        returns (address)
    {
        address owner = _walletsOwner[wallet];
        require(
            owner != address(0),
            "A3SProtocol: Owner query for nonexistent wallet"
        );
        return owner;
    }

    /**
     * @dev See {IA3SWalletFactory-predictWalletAddress}.
     */
    function predictWalletAddress(bytes32 salt)
        external
        view
        virtual
        override
        returns (address)
    {
        return Create2.computeAddress(salt, keccak256(_walletBytecode()));
    }

    /**
     * @dev Returns bytecode of A3SWallet contract.
     */
    function _walletBytecode() internal view returns (bytes memory) {
        bytes memory bytecode = type(A3SWallet).creationCode;
        return abi.encodePacked(bytecode, abi.encode(address(this)));
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._afterTokenTransfer(from, to, tokenId);

        if (from != address(0) && to != address(0)) {
            address wallet = _wallets[tokenId];
            _walletsOwner[wallet] = to;
        }
    }
}
