// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IYieldSource} from "../IYieldSource.sol";
import {MyToken} from "./token.sol";

contract fakeYieldSource is IYieldSource {
  MyToken token;
  uint256 amountDeposited;
  uint256 amountWithdrawn;
  constructor (address _token) {
    token = MyToken(_token);
    amountDeposited = 0;
    amountWithdrawn = 0;
  }
  
  function deposit (uint256 amount) external override {
    amountDeposited += amount;
    token.transferFrom(msg.sender, address(this), amount);
    // generate fake 10% yield
    token.mint(address(this), (110 * amount) / 100);
  }

  function getBalance () external view override returns (uint256) {
    return token.balanceOf(address(this));
  }

  function getYield () external view override returns (uint256) {
    return token.balanceOf(address(this)) + amountWithdrawn - amountDeposited;
  }

  function withdraw (address to, uint256 amount) external override {
    amountWithdrawn += amount;
    token.transfer(to, amount);
  }
}