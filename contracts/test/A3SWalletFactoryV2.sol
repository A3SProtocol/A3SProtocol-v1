//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Create2Upgradeable.sol";

import "../IA3SWalletFactory.sol";
import "../A3SWallet.sol";
import "../MerkleWhitelist.sol";

contract A3SWalletFactoryV2 is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    IA3SWalletFactory,
    MerkleWhitelist
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Token ID counter
    CountersUpgradeable.Counter public tokenIdCounter;

    string public baseTokenURI;

    // Token for fees
    address private _fiatToken;

    // Number of fiat tokens to mint a wallet
    uint256 private _fiatTokenFee;

    // Number of ether to mint a wallet
    uint256 private _etherFee;

    // Mapping from token ID to wallet address
    mapping(uint256 => address) private _wallets;

    // Mapping from  wallet address to token ID
    mapping(address => uint256) private _walletsId;

    // Mapping from  wallet address to owner address
    mapping(address => address) private _walletsOwner;

    receive() external payable {}

    /**
     * @dev See {IA3SWalletFactory-mintWallet}.
     */
    function mintWallet(
        address to,
        bytes32 salt,
        bool useFiatToken,
        bytes32[] calldata proof
    ) external payable virtual override returns (address) {
        if (useFiatToken) {
            require(_fiatToken != address(0), "A3SProtocol: FiatToken not set");
            IERC20Upgradeable(_fiatToken).transferFrom(
                msg.sender,
                address(this),
                _fiatTokenFee
            );
        } else {
            require(msg.value >= _etherFee, "A3SProtocol: Not enough ether");
        }

        tokenIdCounter.increment();
        uint256 amount = 0;
        uint256 newTokenId = tokenIdCounter.current();

        bytes memory walletByteCode = _walletBytecode();
        address newWallet = Create2Upgradeable.deploy(
            amount,
            salt,
            walletByteCode
        );

        _mint(to, newTokenId);

        _wallets[newTokenId] = newWallet;
        _walletsId[newWallet] = newTokenId;
        _walletsOwner[newWallet] = to;

        emit MintWallet(to, salt, newWallet, newTokenId);

        return newWallet;
    }

    /**
     * @dev See {IA3SWalletFactory-mintWallet}.
     */
    function batchTransferFrom(
        address from,
        address to,
        uint256[] calldata tokens
    ) external {
        uint256 balance = balanceOf(from);

        require(tokens.length <= balance, "Not enough tokens");

        for (uint256 i = 0; i < tokens.length; ++i) {
            uint256 tokenId = tokens[i];
            transferFrom(from, to, tokenId);
        }

        emit BatchTransferFrom(from, to, tokens);
    }

    /**
     * @dev Update fiat token for fees to `token`
     */
    function updateFiatToken(address token) public onlyOwner {
        _fiatToken = token;
    }

    /**
     * @dev Update `amount` of fiat tokens to mint a wallet
     */
    function updateFiatTokenFee(uint256 amount) public onlyOwner {
        _fiatTokenFee = amount;
    }

    /**
     * @dev Update ether fees for mint a wallet
     */
    function updateEtherFee(uint256 amount) public onlyOwner {
        _etherFee = amount;
    }

    /**
     * @dev Withdraw `amount` of ether to the _owner
     */
    function withdrawEther(uint256 amount) public onlyOwner {
        uint256 balance = address(this).balance;
        require(amount <= balance, "Not enough ether");
        payable(address(owner())).transfer(amount);
    }

    /**
     * @dev Withdraw `amount` of fiat token to the _owner
     */
    function withdrawToken(uint256 amount) public onlyOwner {
        uint256 balance = IERC20Upgradeable(_fiatToken).balanceOf(
            address(this)
        );
        require(amount <= balance, "Not enough token");
        IERC20Upgradeable(_fiatToken).transfer(owner(), amount);
    }

    /**
     * @dev Returns the fiat token for fees
     */
    function fiatToken() external view returns (address) {
        return _fiatToken;
    }

    /**
     * @dev Returns the amount of fiat token fees
     */
    function fiatTokenFee() external view returns (uint256) {
        return _fiatTokenFee;
    }

    /**
     * @dev Returns the amount of ether fees
     */
    function etherFee() external view returns (uint256) {
        return _etherFee;
    }

    /**
     * @dev See {IA3SWalletFactory-walletOf}.
     */
    function walletOf(uint256 tokenId)
        external
        view
        virtual
        override
        returns (address)
    {
        address wallet = _wallets[tokenId];
        require(
            wallet != address(0),
            "A3SProtocol: Wallet address query for nonexistent token"
        );
        return wallet;
    }

    /**
     * @dev See {IA3SWalletFactory-walletIdOf}.
     */
    function walletIdOf(address wallet)
        external
        view
        virtual
        override
        returns (uint256)
    {
        uint256 tokenId = _walletsId[wallet];
        require(
            tokenId != 0,
            "A3SProtocol: Token ID query for nonexistent wallet"
        );
        return tokenId;
    }

    /**
     * @dev See {IA3SWalletFactory-walletOwnerOf}.
     */
    function walletOwnerOf(address wallet)
        external
        view
        virtual
        override
        returns (address)
    {
        address owner = _walletsOwner[wallet];
        require(
            owner != address(0),
            "A3SProtocol: Owner query for nonexistent wallet"
        );
        return owner;
    }

    /**
     * @dev See {IA3SWalletFactory-predictWalletAddress}.
     */
    function predictWalletAddress(bytes32 salt)
        external
        view
        virtual
        override
        returns (address)
    {
        return
            Create2Upgradeable.computeAddress(
                salt,
                keccak256(_walletBytecode())
            );
    }

    /**
     * @dev Returns bytecode of A3SWallet contract.
     */
    function _walletBytecode() internal view returns (bytes memory) {
        bytes memory bytecode = type(A3SWallet).creationCode;
        return abi.encodePacked(bytecode, abi.encode(address(this)));
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._afterTokenTransfer(from, to, tokenId);

        if (from != address(0) && to != address(0)) {
            address wallet = _wallets[tokenId];
            _walletsOwner[wallet] = to;
        }
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        virtual
        override
        onlyOwner
    {}
}
