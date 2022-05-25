//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

import "./AS3Wallet.sol";

contract A3SWalletFactory is ERC721 {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private idCounter;

    // Mapping from token ID to wallet address
    mapping(uint256 => address) private _wallets;

    // Mapping from  wallet address to token ID
    mapping(address => uint256) private _walletsId;

    // Mapping from  wallet address to owner address
    mapping(address => address) private _walletsOwner;

    /**
     * @dev Emitted when a token for a newly created wallet is minted using create2 of the given `salt`, to `to`
     */
    event MintWallet(address indexed to, bytes32 salt);

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    receive() external payable {}

    /**
     * @dev Mints `tokenId`, creates a A3SWallet, and assign the token to `to`.
     *
     * WARNING: We do not
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function mintWallet(address to, bytes32 salt) external {
        bytes memory walletByteCode = _walletBytecode();
        address newAddr = Create2.deploy(amount, salt, walletByteCode);
        require(
            newAddr != address(0),
            "A3SProtocol: Mint wallet query for unavailable salt"
        );

        idCounter.increment();
        uint256 amount = 0;
        uint256 newId = idCounter.current();

        _mint(to, newId);

        _wallets[newId] = newAddr;
        _walletsId[newAddr] = newId;
        _walletsOwner[newAddr] = to;

        emit MintWallet(_to, _salt);
    }

    /**
     * @dev Returns the wallet addres of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function walletOf(uint256 tokenId) external view returns (address) {
        address wallet = _wallets[tokenId];
        require(
            wallet != address(0),
            "A3SProtocol: Wallet address query for nonexistent token"
        );
        return wallet;
    }

    /**
     * @dev Returns the token ID  of the `wallet` wallet address.
     *
     * Requirements:
     *
     * - `wallet` must exist.
     */
    function walletIdOf(address wallet) external view returns (uint256) {
        uint256 tokenId = _walletsId[wallet];
        require(
            tokenId != 0,
            "A3SProtocol: Token ID query for nonexistent wallet"
        );
        return tokenId;
    }

    /**
     * @dev Returns the owner of the `wallet` wallet address.
     *
     * Requirements:
     *
     * - `owner` must exist.
     */
    function walletOwnerOf(address wallet) external view returns (address) {
        address owner = _walletsOwner[wallet];
        require(owner != 0, "A3SProtocol: Owner query for nonexistent wallet");
        return owner;
    }

    /**
     * @dev Returns the wallet address with given `salt` random bytes.
     *
     * Use "@openzeppelin/contracts/utils/Create2.sol" to compute the wallet address with A3SWalllet bytecodes and `salt`
     */
    function predictWalletAddress(bytes32 salt)
        external
        view
        returns (address)
    {
        return Create2.computeAddress(salt, keccak256(_walletBytecode()));
    }

    /**
     * @dev Returns bytecode of A3SWallet contract.
     */
    function _walletBytecode() internal returns (bytes memory) {
        bytes memory bytecode = type(A3SWallet).creationCode;
        return abi.encodePacked(bytecode);
    }
}
