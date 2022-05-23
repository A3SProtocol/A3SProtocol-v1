//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./IWallet.sol";

import "hardhat/console.sol";

contract Wallet is IWallet, ERC721Holder {
    address public owner;
    address public walletOwner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyWalletOwner() {
        require(msg.sender == walletOwner, "Caller is not wallet owner");
        _;
    }

    modifier enoughEther(uint256 _amount) {
        uint256 balance = address(this).balance;
        require(_amount <= balance, "Not enough ether");
        _;
    }

    modifier enoughERC2O(address _token, uint256 _amount) {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        require(_amount <= balance, "Not enough token");
        _;
    }

    modifier enoughERC721(address _token, uint256 _tokenId) {
        address tokenOwner = IERC721(_token).ownerOf(_tokenId);
        require(tokenOwner == address(this), "Token not exist");
        _;
    }

    constructor(address _walletOwner) {
        owner = msg.sender;
        walletOwner = _walletOwner;
    }

    receive() external payable {}

    // Ether
    function transferEther(address _to, uint256 _amount)
        external
        onlyWalletOwner
        enoughEther(_amount)
    {
        payable(_to).transfer(_amount);
        emit TransferEther(_to, _amount);
    }

    // ERC-20
    function transferERC20(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyWalletOwner enoughERC2O(_token, _amount) {
        IERC20(_token).transfer(_to, _amount);
        emit TransferERC20(_token, _to, _amount);
    }

    function approveERC20(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyWalletOwner enoughERC2O(_token, _amount) {
        IERC20(_token).approve(_to, _amount);
        emit ApproveERC20(_token, _to, _amount);
    }

    function transferFromERC20(
        address _token,
        address _from,
        uint256 _amount
    ) external onlyWalletOwner enoughERC2O(_token, _amount) {
        IERC20(_token).transferFrom(_from, address(this), _amount);
        emit TransferFromERC20(_token, _from, _amount);
    }

    // ERC-721
    function approveERC721(
        address _token,
        address _to,
        uint256 _tokenId
    ) external onlyWalletOwner enoughERC721(_token, _tokenId) {
        IERC721(_token).approve(_to, _tokenId);
        emit ApproveERC721(_token, _to, _tokenId);
    }

    function setApprovalForAllERC721(
        address _token,
        address _to,
        bool _approved
    ) external onlyWalletOwner {
        IERC721(_token).setApprovalForAll(_to, _approved);
        emit SetApprovalForAllERC721(_token, _to, _approved);
    }

    function transferFromERC721(
        address _token,
        address _from,
        address _to,
        uint256 _tokenId
    ) external onlyWalletOwner enoughERC721(_token, _tokenId) {
        IERC721(_token).safeTransferFrom(_from, _to, _tokenId);
        emit TransferFromERC721(_token, _from, _to, _tokenId);
    }

    // Change Wallet Owner
    function changeWalletOwner(address _newWalletOwner) external onlyOwner {
        require(
            _newWalletOwner != address(0),
            "New wallet owner can not be 0-address."
        );
        address oldWalletOwner = walletOwner;

        walletOwner = _newWalletOwner;
        emit ChangeWalletOwner(oldWalletOwner, _newWalletOwner, address(this));
    }
}
