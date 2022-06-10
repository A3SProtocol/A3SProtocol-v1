//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Create2Upgradeable.sol";

import "./IA3SWalletFactory.sol";
import "./A3SWallet.sol";
import "./MerkleWhitelist.sol";

contract A3SWalletFactory is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ERC721Upgradeable,
    IA3SWalletFactory,
    MerkleWhitelist
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Token ID counter
    CountersUpgradeable.Counter public tokenIdCounter;

    string public baseTokenURI;

    // Token for fees
    address public fiatToken;

    // Number of fiat tokens to mint a wallet
    uint256 public fiatTokenFee;

    // Number of ether to mint a wallet
    uint256 public etherFee;

    // Mapping from token ID to wallet address
    mapping(uint256 => address) private _wallets;

    // Mapping from  wallet address to token ID
    mapping(address => uint256) private _walletsId;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    function initialize(string calldata _uri) public initializer {
        baseTokenURI = _uri;
        __ERC721_init("A3SProtocol", "A3S");
        __Ownable_init();
    }

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
        _claimWhitelist(address(msg.sender), proof);

        if (useFiatToken) {
            require(fiatToken != address(0), "A3SProtocol: FiatToken not set");
            IERC20Upgradeable(fiatToken).transferFrom(
                msg.sender,
                address(this),
                fiatTokenFee
            );
        } else {
            require(msg.value >= etherFee, "A3SProtocol: Not enough ether");
        }

        tokenIdCounter.increment();
        uint256 newTokenId = tokenIdCounter.current();
        address newWallet = Create2Upgradeable.deploy(
            0,
            salt,
            _walletBytecode()
        );

        _mint(to, newTokenId);

        _wallets[newTokenId] = newWallet;
        _walletsId[newWallet] = newTokenId;

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
        require(tokens.length <= balanceOf(from), "Not enough tokens");

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
        fiatToken = token;
    }

    /**
     * @dev Update `amount` of fiat tokens to mint a wallet
     */
    function updateFiatTokenFee(uint256 amount) public onlyOwner {
        fiatTokenFee = amount;
    }

    /**
     * @dev Update ether fees for mint a wallet
     */
    function updateEtherFee(uint256 amount) public onlyOwner {
        etherFee = amount;
    }

    /**
     * @dev Withdraw `amount` of ether to the _owner
     */
    function withdrawEther(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Not enough ether");
        payable(address(owner())).transfer(amount);
    }

    /**
     * @dev Withdraw `amount` of fiat token to the _owner
     */
    function withdrawToken(uint256 amount) public onlyOwner {
        uint256 balance = IERC20Upgradeable(fiatToken).balanceOf(address(this));
        require(amount <= balance, "Not enough token");
        IERC20Upgradeable(fiatToken).transfer(owner(), amount);
    }

    /**
     * @dev See {IA3SWalletFactory-walletOf}.
     */
    function walletOf(uint256 tokenId)
        public
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
        public
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
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = ownerOf(walletIdOf(wallet));
        require(
            owner != address(0),
            "A3SProtocol: Owner query for nonexistent wallet"
        );
        return owner;
    }

    function walletListOwnerOf(address owner)
        public
        view
        returns (address[] memory)
    {
        address[] memory results = new address[](balanceOf(owner));
        uint256 id = 1;
        uint256 count = 0;
        for (; id <= tokenIdCounter.current(); id++) {
            ownerOf(id) == owner;
            results[count] = ownerOf(id);
        }

        return results;
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

    function _authorizeUpgrade(address newImplementation)
        internal
        virtual
        override
        onlyOwner
    {}
}
