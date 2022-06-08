//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "hardhat/console.sol";

contract MerkleWhitelist is OwnableUpgradeable {
    bytes32 private _rootHash;
    uint256 private _round;
    bool private _isLimited;

    mapping(address => uint256) private _calims;

    event UpdateMerkleRoot(bytes32 rootHash);

    event Claim(address sender, uint256 round);

    function updateRootHash(bytes32 merkleRootHash) public onlyOwner {
        _rootHash = merkleRootHash;

        emit UpdateMerkleRoot(merkleRootHash);
    }

    function updateRound() public onlyOwner {
        _round += 1;
    }

    function updateIsLimited(bool limited) public onlyOwner {
        _isLimited = limited;
    }

    function rootHash() public view returns (bytes32) {
        return _rootHash;
    }

    function round() public view returns (uint256) {
        return _round;
    }

    function isLimited() public view returns (bool) {
        return _isLimited;
    }

    function isCalimed(address account) public view returns (bool) {
        return _calims[account] == _round;
    }

    function isInWhitelist(bytes32[] calldata proof)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(proof, _rootHash, leaf);
    }

    function claim(bytes32[] calldata proof) public {
        require(isInWhitelist(proof), "MerkleWhitelist: Not in the whitelist");
        _calims[msg.sender] = _round;
        emit Claim(msg.sender, _round);
    }
}
