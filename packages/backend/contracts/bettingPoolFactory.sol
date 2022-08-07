// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import {BettingPool} from "./bettingPool.sol";


contract BettingPoolFactory { // TODO: use ownable?
  BettingPool[] public pools;

  event PoolCreated(
    address indexed owner,
    address indexed token,
    address indexed resultController
  );

  function createPool (address token, address resultController, address yieldSrc) external {
    BettingPool pool = new BettingPool(msg.sender, token, resultController, yieldSrc);
    pools.push(pool);
    emit PoolCreated(msg.sender, address(0), address(0));
  }

  function poolCount () public view returns(uint256) {
    return pools.length;
  }
}