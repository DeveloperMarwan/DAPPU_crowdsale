// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

    event Buy(uint256 _amount, address _buyer);

    constructor(Token _token, uint256 _price, uint256 _maxTokens) {
        token       =_token;
        price       = _price;
        maxTokens   = _maxTokens;
        // console.log("price: ", price);
        // console.log("maxTokens: ", maxTokens);
        // console.log("tokensSold: ", tokensSold);
    }

    function buyTokens(uint256 _amount) public payable {
        require(token.balanceOf(address(this)) >= _amount);
        require(msg.value == (_amount / 1e18) * price);
        require(token.transfer(msg.sender, _amount));
        tokensSold += _amount;
        // console.log("tokensSold: ", tokensSold);

        emit Buy(_amount, msg.sender);
    }

    receive() external payable {
        uint256 tokenAmt = msg.value / price;
        buyTokens(tokenAmt * 1e18);
    }
}