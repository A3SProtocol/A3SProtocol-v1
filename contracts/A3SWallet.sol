//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./IA3SWalletFactory.sol";

contract A3SWallet is ERC721Holder {
    // Factory Address
    address private _factory;

    /**
     * @dev Emitted when succeed use low level call to `contracAddress` with precalculated `payload`
     */
    event GeneralCall(address indexed contracAddress, bytes indexed payload);

    /**
     * @dev Throws if called by any account other than the owner recorded in the factory.
     */
    modifier onlyOwner() {
        address owner = IA3SWalletFactory(_factory).walletOwnerOf(
            address(this)
        );
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor(address factoryAddress) {
        _factory = factoryAddress;
    }

    receive() external payable {}

    /**
     * @dev Returns the output bytes data from low level call to `contracAddress` with precalculated `payload`
     */
    function generalCall(address contracAddress, bytes memory payload)
        public
        onlyOwner
        returns (bytes memory)
    {
        (bool success, bytes memory returnData) = address(contracAddress).call(
            payload
        );
        require(success, "A3SProtocol: General call query failed.");
        return returnData;
    }

    /**
     * @dev Returns factory address.
     */
    function factory() external view returns (address) {
        return _factory;
    }

    /**
     * @dev Returns the owner of the wallet from WalletFactory.
     */
    function ownerOf() external view returns (address) {
        return IA3SWalletFactory(_factory).walletOwnerOf(address(this));
    }
}
