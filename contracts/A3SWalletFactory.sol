//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

import "./IA3SWalletFactory.sol";
import "./A3SWallet.sol";
import "./old/Empty.sol";

import "hardhat/console.sol";

contract A3SWalletFactory is ERC721, Ownable, IA3SWalletFactory {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private tokenIdCounter;

    // Token for fees
    address private _fiatToken;

    uint256 private _fee;

    // Mapping from token ID to wallet address
    mapping(uint256 => address) private _wallets;

    // Mapping from  wallet address to token ID
    mapping(address => uint256) private _walletsId;

    // Mapping from  wallet address to owner address
    mapping(address => address) private _walletsOwner;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _fee = 0;
    }

    receive() external payable {}

    /**
     * @dev See {IA3SWalletFactory-mintWallet}.
     */
    function mintWallet(address to, bytes32 salt) external virtual override {
        // IERC20(_fiatToken).transferFrom(msg.sender, address(this), _fee);

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
     * @dev Transfer a batch of `tokens` from `from` to `bo`
     *
     * Requirements:
     *
     * - msg.sender must be the owner or approved for every token in `tokens`
     * - every token in `tokens` must belongs to `from`.
     * - `to` cannot be the zero address.
     *
     * Emits a {MintWallet} event.
     */
    function batchTransferFrom(
        address from,
        address to,
        uint256[] memory tokens
    ) external {
        uint256 balance = _balances[from];
        require(balance < tokens.length, "Not enough tokens");

        for (uint256 i = 0; i < tokens.length; ++i) {
            uint256 tokenId = tokens[i];
            address owner = _owners[tokenId];

            require(
                _isApprovedOrOwner(_msgSender(), tokenId),
                "A3SProtocol: transfer caller is not owner nor approved"
            );
            require(
                from == owner,
                "A3SProtocol: transfer from incorrect owner"
            );
            require(
                to != address(0),
                "A3SProtocol: transfer to the zero address"
            );

            _approve(address(0), tokenId);
            _owners[tokenId] = to;
        }

        _balances[from] -= tokens.length;
        _balances[to] += tokens.length;

        emit BatchTransferFrom(from, to, tokens)
    }

    /**
     * @dev Update fiat token for fees to `token`
     */
    function updateFiatToken(address token) public onlyOwner {
        _fiatToken = token;
    }

    /**
     * @dev Withdraw `amount` of ether to the _owner
     */
    function withdrawEther(uint256 amount) public onlyOwner {
        uint256 balance = address(this).balance;
        require(amount <= balance, "Not enough ether");
        address(_owner).transfer(amount);
    }

    /**
     * @dev Withdraw `amount` of fiat token to the _owner
     */
    function withdrawToken(uint256 amount) public onlyOwner {
        uint256 balance = IERC20(_fiatToken).balanceOf(address(this));
        require(amount <= balance, "Not enough token");
        IERC20(_fiatToken).transfer(_owner, amount);
    }

    /**
     * @dev Returns the fiat token for fees
     */
    function fiatToken() external view returns (address) {
        return _fiatToken;
    }

    /**
     * @dev Returns the amount of the fee
     */
    function fee() external view returns (uint256) {
        return _fee;
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
