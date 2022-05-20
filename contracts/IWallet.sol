//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWallet {

    event TransferEther (address indexed _to, uint256 _amount);
    event TransferERC20 (address indexed _token, address indexed _to, uint256 _amount);  
    event ApproveERC20 (address indexed _token, address indexed _to, uint256 _amount);
    event TransferFromERC20 (address indexed _token, address indexed _from, uint256 _amount);
    event ApproveERC721 (address indexed _token, address indexed _to, uint256 _tokenId);
    event SetApprovalForAllERC721 (address indexed _token, address indexed _to, bool _approved);
    event TransferFromERC721 (address indexed _token, address indexed _from, address indexed _to, uint256 _tokenId);
    event ChangeWalletOwner(address indexed _oldOwner, address indexed _mewOwner, address indexed _wallet);


    // Ether 
    function transferEther(address _to, uint256 _amount) external;

    // ERC-20
    function transferERC20(address _token, address _to, uint256 _amount) external;

    function approveERC20(address _token, address _to, uint256 _amount) external;

    function transferFromERC20(address _token, address _from, uint256 _amount) external;

    // ERC-721
    function approveERC721(address _token, address _to, uint256 _tokenId) external;

    function setApprovalForAllERC721(address _token, address _to, bool _approved) external;
    
    function transferFromERC721(address _token, address _from, address _to, uint256 _tokenId) external;

    // Change Wallet Owner
    function changeWalletOwner(address _newWalletOwner) external;
}