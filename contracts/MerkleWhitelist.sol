//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./IMerkleWhitelist.sol";

contract MerkleWhitelist is Ownable, IMerkleWhitelist {
    bool public isLimited;
    address public factory;
    address public executor;
    bytes32 public rootHash;
    uint256 public round;

    mapping(address => uint256) public claimedWhitelist;

    modifier onlyExecutorOrOwner() {
        require(
            msg.sender == owner() || msg.sender == executor,
            "Caller is not Executor or Owner"
        );
        _;
    }

    function updateExecutor(address executorAddress) external {
        executor = executorAddress;
    }

    function updateRootHash(bytes32 merkleRootHash)
        external
        onlyExecutorOrOwner
    {
        rootHash = merkleRootHash;
        emit UpdateMerkleRoot(merkleRootHash);
    }

    function updateFactory(address factoryAddress) external onlyOwner {
        factory = factoryAddress;
    }

    function updateRound() public onlyOwner {
        round += 1;
    }

    function updateIsLimited(bool limited) external onlyOwner {
        isLimited = limited;
    }

    function isMintable(address owner, bytes32[] calldata proof)
        external
        view
        returns (uint256)
    {
        uint256 status = 0;

        if (isLimited) {
            if (isWhitelisted(owner, proof)) {
                if (claimedWhitelist[msg.sender] == round) {
                    status = 1;
                } else {
                    status = 2;
                }
            }
        } else {
            status = 3;
        }

        return status;
    }

    function isWhitelisted(address owner, bytes32[] calldata proof)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(owner));
        return MerkleProof.verify(proof, rootHash, leaf);
    }

    function claimWhitelist(address owner, bytes32[] calldata proof) external {
        require(msg.sender == factory, "Invalid Caller");

        if (isLimited) {
            require(isWhitelisted(owner, proof), "WL: Not whitelisted");

            require(
                claimedWhitelist[msg.sender] != round,
                "WL: Already Calimed"
            );

            claimedWhitelist[msg.sender] = round;
            emit ClaimWhitelist(msg.sender, round);
        }
    }
}
