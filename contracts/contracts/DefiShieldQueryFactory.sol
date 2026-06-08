// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DefiShieldQuery.sol";

contract DefiShieldQueryFactory {
    address public paymentToken;
    uint256 public queryPrice;
    
    constructor(address _paymentToken, uint256 _queryPrice) {
        paymentToken = _paymentToken;
        queryPrice = _queryPrice;
    }
    
    function createQueryContract() external returns (DefiShieldQuery) {
        DefiShieldQuery query = new DefiShieldQuery(paymentToken);
        query.setQueryPrice(queryPrice);
        return query;
    }
    
    function setPaymentToken(address _paymentToken) external {
        paymentToken = _paymentToken;
    }
    
    function setQueryPrice(uint256 _queryPrice) external {
        queryPrice = _queryPrice;
    }
}
