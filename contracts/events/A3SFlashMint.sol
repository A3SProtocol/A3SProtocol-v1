//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../IA3SWalletFactory.sol";
import "../IMerkleWhitelist.sol";

contract A3SFlashMint is Ownable {
    address private _whitelist;
    address private _factory;

    event FlashMint(address recipient, uint256 amount);

    event ReturnWhitelistOwnership(uint256 blockTime);

    constructor(address whitelist_, address factory_) {
        _whitelist = whitelist_;
        _factory = factory_;
    }

    function bunchMint(address recipient, uint256 amount) public onlyOwner {
        bytes32 salt;
        bytes32[] memory proof;
        for (uint256 index; index < amount; index++) {
            salt = keccak256(abi.encodePacked(block.timestamp, index));
            IA3SWalletFactory(_factory).mintWallet(
                recipient,
                salt,
                false,
                proof
            );
        }
    }

    function flashMint(address recipient, uint256 amount) external onlyOwner {
        require(Ownable(_whitelist).owner() == address(this), "Unauthorized");
        require(
            IMerkleWhitelist(_whitelist).isLimited(),
            "Whitelist is unlimited"
        );

        IMerkleWhitelist(_whitelist).updateIsLimited(false);

        bunchMint(recipient, amount);

        IMerkleWhitelist(_whitelist).updateIsLimited(true);

        emit FlashMint(recipient, amount);
    }

    function returnWhitelistOwnership() external onlyOwner {
        Ownable(_whitelist).transferOwnership(owner());

        emit ReturnWhitelistOwnership(block.timestamp);
    }

    function whitelist() external view returns (address) {
        return _whitelist;
    }

    function factory() external view returns (address) {
        return _factory;
    }
}
