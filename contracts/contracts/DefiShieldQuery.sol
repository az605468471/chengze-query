// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DefiShieldQuery
 * @dev Query fee payment contract for DeFi Shield platform
 * Users pay to unlock contract analysis queries
 */
contract DefiShieldQuery {
    address public owner;
    uint256 public queryPrice = 1 * 10**18; // 1 USDT (or BNB)
    address public paymentToken; // USDT/BSC address
    
    mapping(address => bool) public hasPaid;
    mapping(address => uint256) public paidUntil;
    
    event QueryPaid(address indexed user, uint256 amount, uint256 until);
    event PriceUpdated(uint256 newPrice);
    event Withdrawn(address indexed owner, uint256 amount);
    
    constructor(address _paymentToken) {
        owner = msg.sender;
        paymentToken = _paymentToken;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev User pays to unlock queries
     * @param amount Payment amount in USDT/BNB
     */
    function payForQuery(uint256 amount) external payable {
        require(amount >= queryPrice, "Insufficient payment");
        
        if (paymentToken != address(0)) {
            // ERC20 token payment
            IERC20 token = IERC20(paymentToken);
            require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        } else {
            // BNB payment
            require(msg.value >= amount, "Insufficient BNB");
        }
        
        hasPaid[msg.sender] = true;
        paidUntil[msg.sender] = block.timestamp + 30 days; // 30 days access
        
        emit QueryPaid(msg.sender, amount, paidUntil[msg.sender]);
    }
    
    /**
     * @dev Check if user has active access
     */
    function hasActiveAccess(address user) external view returns (bool) {
        return hasPaid[user] && paidUntil[user] > block.timestamp;
    }
    
    /**
     * @dev Update query price (owner only)
     */
    function setQueryPrice(uint256 newPrice) external onlyOwner {
        queryPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    /**
     * @dev Update payment token (owner only)
     */
    function setPaymentToken(address newToken) external onlyOwner {
        paymentToken = newToken;
    }
    
    /**
     * @dev Withdraw collected fees (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance;
        if (paymentToken == address(0)) {
            balance = address(this).balance;
            payable(owner).transfer(balance);
        } else {
            balance = IERC20(paymentToken).balanceOf(address(this));
            require(IERC20(paymentToken).transfer(owner, balance), "Transfer failed");
        }
        emit Withdrawn(owner, balance);
    }
    
    /**
     * @dev Get query price in USDT/BNB
     */
    function getQueryPrice() external view returns (uint256) {
        return queryPrice;
    }
    
    /**
     * @dev Get remaining access time
     */
    function getRemainingTime(address user) external view returns (uint256) {
        if (!hasPaid[user] || paidUntil[user] <= block.timestamp) {
            return 0;
        }
        return paidUntil[user] - block.timestamp;
    }
}
