// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import {BettingPool} from "./bettingPool.sol";
import {notQuiteRandomCoinFlip} from "./notQuiteRandom/coinFlip.sol";
import {fakeYieldSource} from "./test/fakeYield.sol";


contract BettingPoolFactory { // TODO: use ownable?
  BettingPool[] public pools;

  event PoolCreated(
    address indexed owner,
    address indexed token,
    address indexed resultController,
    address pollAddress,
    uint256 poolIndex
  );

  function createPool (address token, address resultController, address yieldSrc) external returns(uint256) {
    return _createPool(token, resultController, yieldSrc);
  }

  function createDefaultPool (address token) external returns(uint256) {
    notQuiteRandomCoinFlip controller = new notQuiteRandomCoinFlip(msg.sender);
    fakeYieldSource yieldSource = new fakeYieldSource(token);
    return _createPool (token, address(controller), address(yieldSource));
  }

  function poolCount () public view returns(uint256) {
    return pools.length;
  }

  function _createPool (address token, address resultController, address yieldSrc) private returns(uint256) {
    BettingPool pool = new BettingPool(msg.sender, token, resultController, yieldSrc);
    pools.push(pool);
    uint256 pollIndex = pools.length - 1;
    emit PoolCreated(msg.sender, address(token), address(resultController), address(pool), pollIndex);
    return pollIndex;
  }
}