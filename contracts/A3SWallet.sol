//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract A3SWallet is ERC721Holder {
    constructor() {}

    receive() external payable {}
}
