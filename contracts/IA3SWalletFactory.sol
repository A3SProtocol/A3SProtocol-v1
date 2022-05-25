//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IA3SWalletFactory is IERC721 {
    /**
     * @dev Emitted when a token for a newly created wallet is minted using create2 of the given `salt`, to `to`
     */
    event MintWallet(address indexed to, bytes32 salt);

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
     * Emits a {MintWallet} event.
     */
    function mintWallet(address to, bytes32 salt) public;

    /**
     * @dev Returns the token ID  of the `wallet` wallet address.
     *
     * Requirements:
     *
     * - `wallet` must exist.
     */
    function walletIdOf(address wallet) public view returns (uint256);

    /**
     * @dev Returns the owner of the `wallet` wallet address.
     *
     * Requirements:
     *
     * - `owner` must exist.
     */
    function walletOwnerOf(address wallet) public view returns (address);

    /**
     * @dev Returns the wallet address computed with create2 method with given `salt` bytes32.
     */
    function predictWalletAddress(bytes32 salt) public view returns (address);
}
