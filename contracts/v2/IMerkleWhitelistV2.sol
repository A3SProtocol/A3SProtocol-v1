//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IMerkleWhitelistV2 {
    event UpdateMerkleRoot(bytes32 rootHash);

    event ClaimWhitelist(address indexed sender, string approvalCode);

    function isWhitelisted(
        address owner,
        string calldata approvalCode,
        bytes32[] calldata proof
    ) external view returns (bool);

    function claimWhitelist(
        address owner,
        string calldata approvalCode,
        bytes32[] calldata proof
    ) external;

    function updateIsLimited(bool limited) external;

    function isLimited() external view returns (bool);
}
