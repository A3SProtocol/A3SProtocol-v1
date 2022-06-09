//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleWhitelist is Initializable, OwnableUpgradeable {
    bytes32 public rootHash;
    uint256 public round;
    bool public isLimited;

    mapping(address => uint256) public _claimedWhitelist;

    event UpdateMerkleRoot(bytes32 rootHash);

    event ClaimWhitelist(address indexed sender, uint256 round);

    function updateRootHash(bytes32 merkleRootHash) external onlyOwner {
        rootHash = merkleRootHash;
        emit UpdateMerkleRoot(merkleRootHash);
    }

    function updateRound() public onlyOwner {
        round += 1;
    }

    function updateIsLimited(bool limited) public onlyOwner {
        isLimited = limited;
    }

    function proveWhitelisted(bytes32[] calldata proof)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(proof, rootHash, leaf);
    }

    function _claimWhitelist(bytes32[] calldata proof) internal {
        if (isLimited) {
            require(
                proveWhitelisted(proof),
                "MerkleWhitelist: Account is not in the whitelist"
            );

            require(
                _claimedWhitelist[msg.sender] != round,
                "MerkleWhitelist: Account can not calim whitelist twice"
            );

            _claimedWhitelist[msg.sender] = round;
            emit ClaimWhitelist(msg.sender, round);
        }
    }
}
