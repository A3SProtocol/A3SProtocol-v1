//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract MerkleWhitelist is Ownable {
    bytes32 private _rootHash;
    uint256 private _round = 1;
    bool private _isLimited;

    mapping(address => uint256) private _calims;

    event UpdateMerkleRoot(bytes32 rootHash);

    event Claim(address sender, uint256 round);

    constructor() {}

    function updateRootHash(bytes32 merkleRootHash) external onlyOwner {
        _rootHash = merkleRootHash;

        emit UpdateMerkleRoot(merkleRootHash);
    }

    function updateRound() external onlyOwner {
        _round += 1;
    }

    function updateIsLimited(bool limited) external onlyOwner {
        _isLimited = limited;
    }

    function rootHash() external view returns (bytes32) {
        return _rootHash;
    }

    function round() external view returns (uint256) {
        return _round;
    }

    function isLimited() external view returns (bool) {
        return _isLimited;
    }

    function isCalimed(address account) external view returns (bool) {
        return _calims[account] == _round;
    }

    function isInWhitelist(bytes32[] calldata proof)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));

        console.logBytes32(_rootHash);
        console.logBytes32(proof[0]);
        console.logBytes32(proof[1]);

        return MerkleProof.verify(proof, _rootHash, leaf);
    }

    function claim(bytes32[] calldata proof) external {
        require(isInWhitelist(proof), "MerkleWhitelist: Not in the whitelist");
        _calims[msg.sender] = _round;
        emit Claim(msg.sender, _round);
    }
}
