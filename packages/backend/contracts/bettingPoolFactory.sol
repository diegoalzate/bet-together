// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {BettingPool} from "./bettingPool.sol";

contract BettingPoolFactory { 
  BettingPool[] public pools;

  event PoolCreated(
    address indexed owner,
    address indexed token,
    address indexed pollAddress,
    address resultController ,
    uint256 poolIndex
  );

  function poolCount () public view returns(uint256) {
    return pools.length;
  }

  function createPool (address token, address resultController, address yieldSrc) external returns(uint256) {
    return _createPool(token, resultController, yieldSrc);
  }

  function _createPool (address token, address resultController, address yieldSrc) private returns(uint256) {
    BettingPool pool = new BettingPool(msg.sender, token, resultController, yieldSrc);
    pools.push(pool);
    uint256 pollIndex = pools.length - 1;
    emit PoolCreated(msg.sender, address(token), address(resultController), address(pool), pollIndex);
    return pollIndex;
  }

  //   return vrfFactory.createCoinFlipController(msg.sender);
  // }

}