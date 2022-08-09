//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./IMerkleWhitelistV2.sol";

contract MerkleWhitelistV2 is Ownable, IMerkleWhitelistV2 {
    bool public isLimited;
    address public factory;
    address public executor;
    bytes32 public rootHash;

    mapping(bytes32 => bool) public isClaimed;

    enum MintableStatus {
        NOT_WHITELISTED,
        ALREADY_CLAIMED,
        NOT_CLAINED,
        NOT_LIMITED
    }

    modifier onlyExecutorOrOwner() {
        require(
            msg.sender == owner() || msg.sender == executor,
            "Caller is not Executor or Owner"
        );
        _;
    }

    function updateExecutor(address executorAddress) external onlyOwner {
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

    function updateIsLimited(bool limited) external onlyOwner {
        isLimited = limited;
    }

    function getMerkleLeaf(address owner, string calldata approvalCode)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(owner, approvalCode));
    }

    function isMintable(
        address owner,
        string calldata approvalCode,
        bytes32[] calldata proof
    ) external view returns (uint256) {
        MintableStatus status = MintableStatus.NOT_WHITELISTED;

        if (isLimited) {
            if (isWhitelisted(owner, approvalCode, proof)) {
                bytes32 leaf = getMerkleLeaf(owner, approvalCode);
                if (isClaimed[leaf]) {
                    status = MintableStatus.ALREADY_CLAIMED;
                } else {
                    status = MintableStatus.NOT_CLAINED;
                }
            }
        } else {
            status = MintableStatus.NOT_LIMITED;
        }

        return uint256(status);
    }

    function isWhitelisted(
        address owner,
        string calldata approvalCode,
        bytes32[] calldata proof
    ) public view returns (bool) {
        bytes32 leaf = getMerkleLeaf(owner, approvalCode);
        return MerkleProof.verify(proof, rootHash, leaf);
    }

    function claimWhitelist(
        address owner,
        string calldata approvalCode,
        bytes32[] calldata proof
    ) external {
        require(msg.sender == factory, "Invalid Caller");

        if (isLimited) {
            require(
                isWhitelisted(owner, approvalCode, proof),
                "WL: Not whitelisted"
            );

            bytes32 leaf = getMerkleLeaf(owner, approvalCode);
            require(!isClaimed[leaf], "WL: Already Calimed");

            isClaimed[leaf] = true;

            emit ClaimWhitelist(owner, approvalCode);
        }
    }
}
