// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

library SafeMath {

    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }


    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    error OwnableUnauthorizedAccount(address account);

    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract TokenClaim is Ownable(msg.sender) {
    using SafeMath for uint256;

    IERC20 public token;
    uint256 public rewardPerClaim;
    uint256 public claimInterval;
    uint256 public totalRewards;
    bool public rewardsPaused;

    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public withdrawalAmount;
    mapping(address => bool) public hasClaimed;

    // New mappings to store user information
    address[] public users;
    mapping(address => uint256) public userIndex;

    event TokensClaimed(address indexed user, uint256 amount);
    event TokensDeposited(address indexed owner, uint256 amount);
    event RewardsPaused(address indexed owner);
    event RewardsResumed(address indexed owner);
    event RewardParametersUpdated(address indexed owner, uint256 newRewardPerClaim, uint256 newClaimInterval);
    event WithdrawalInitiated(address indexed user, uint256 amount);
    event WithdrawalCompleted(address indexed user, uint256 amount);

    modifier notPaused() {
        require(!rewardsPaused, "Rewards are paused");
        _;
    }

    function claimTokens() external notPaused {
        require(lastClaimTime[msg.sender] + claimInterval <= block.timestamp, "Claim not yet allowed");
        uint256 elapsedTime = block.timestamp.sub(lastClaimTime[msg.sender]);
        uint256 numberOfClaims = elapsedTime.div(claimInterval);
        uint256 claimableTokens = rewardPerClaim.mul(numberOfClaims);

        require(claimableTokens > 0, "No tokens to claim");
        require(claimableTokens <= totalRewards, "Not enough tokens in the contract");

        lastClaimTime[msg.sender] = lastClaimTime[msg.sender].add(numberOfClaims.mul(claimInterval));
        totalRewards = totalRewards.sub(claimableTokens);
        withdrawalAmount[msg.sender] = withdrawalAmount[msg.sender].add(claimableTokens);
        hasClaimed[msg.sender] = true;

        // Add the user to the list if not already present
        if (userIndex[msg.sender] == 0) {
            users.push(msg.sender);
            userIndex[msg.sender] = users.length;
        }

        emit TokensClaimed(msg.sender, claimableTokens);
    }

    function initiateWithdrawal(uint256 amount) external {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(amount <= withdrawalAmount[msg.sender], "Invalid withdrawal amount");

        withdrawalAmount[msg.sender] = withdrawalAmount[msg.sender].sub(amount);
        token.transfer(msg.sender, amount);

        emit WithdrawalCompleted(msg.sender, amount);
    }

    function depositTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Deposit amount must be greater than 0");

        // Assuming the owner approves the contract to spend tokens before calling this function
        token.transferFrom(owner(), address(this), amount);
        totalRewards = totalRewards.add(amount);

        emit TokensDeposited(owner(), amount);
    }

    function pauseRewards() external onlyOwner {
        require(!rewardsPaused, "Rewards are already paused");
        rewardsPaused = true;

        emit RewardsPaused(owner());
    }

    function resumeRewards() external onlyOwner {
        require(rewardsPaused, "Rewards are not paused");
        rewardsPaused = false;

        emit RewardsResumed(owner());
    }

    function updateRewardParameters(uint256 newRewardPerClaim, uint256 newClaimInterval) external onlyOwner {
        require(newRewardPerClaim > 0, "New reward per claim must be greater than 0");
        require(newClaimInterval > 0, "New claim interval must be greater than 0");

        rewardPerClaim = newRewardPerClaim;
        claimInterval = newClaimInterval;

        emit RewardParametersUpdated(owner(), newRewardPerClaim, newClaimInterval);
    }

    function getRemainingTokens() external view returns (uint256) {
        return totalRewards;
    }

    function getUserClaimStatus(address user) external view returns (bool) {
        return hasClaimed[user];
    }

    function getTotalDistributedRewards() external view returns (uint256) {
        // Calculate total distributed rewards
        uint256 totalDistributedRewards = 0;

        // Loop through all users
        for (uint256 i = 0; i < users.length; i++) {
            totalDistributedRewards = totalDistributedRewards.add(withdrawalAmount[users[i]]);
        }

        return totalDistributedRewards;
    }

    function getTotalClaimedUsers() external view returns (uint256) {
        // Return the total number of claimed users
        return users.length;
    }

    function withdrawRemainingTokens() external onlyOwner {
        require(totalRewards > 0, "No remaining tokens to withdraw");
        token.transfer(owner(), totalRewards);
        totalRewards = 0;
    }
}