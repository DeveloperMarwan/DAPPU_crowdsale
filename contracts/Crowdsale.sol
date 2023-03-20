// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

    event Buy(uint256 _amount, address _buyer);
    event Finalize(uint256 _tokensSold, uint256 _ethRaised);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller must be owner");
        _;
    }

    constructor(Token _token, uint256 _price, uint256 _maxTokens) {
        owner       = msg.sender;
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

    function finalize() public onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));
        uint256 contractBalance = address(this).balance;
        (bool sent, ) = owner.call{value: contractBalance}("");
        require(sent);

        emit Finalize(tokensSold, contractBalance);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }
}