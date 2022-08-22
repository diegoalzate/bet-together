// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import {BettingPool} from "./bettingPool.sol";
import {notQuiteRandomCoinFlip} from "./notQuiteRandom/coinFlip.sol";
import {fakeYieldSource} from "./test/fakeYield.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {VRFResultFactory} from "./vrf/factory.sol";


contract BettingPoolFactory is Ownable { 
  BettingPool[] public pools;
  VRFResultFactory public vrfFactory;

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

  function createDefaultPool (address token) external returns(uint256) {
    // return createNotQuiteRandomPool(token);
    return createVRFPool(token);
  }
  
  function createNotQuiteRandomPool (address token) public returns(uint256) {
    notQuiteRandomCoinFlip controller = new notQuiteRandomCoinFlip(msg.sender);
    fakeYieldSource yieldSource = new fakeYieldSource(token);
    return _createPool (token, address(controller), address(yieldSource));
  }

  function setVrfFactory (address a) public onlyOwner {
    vrfFactory = VRFResultFactory(a);
  }

  function createVRFPool (address token) public returns(uint256) {
    require(address(vrfFactory) != address(0), "vrfFactory not inisialyzed.");
    address controller = vrfFactory.createCoinFlipController(msg.sender);
    fakeYieldSource yieldSource = new fakeYieldSource(token);
    return _createPool (token, controller, address(yieldSource));
  }

  function _createPool (address token, address resultController, address yieldSrc) private returns(uint256) {
    BettingPool pool = new BettingPool(msg.sender, token, resultController, yieldSrc);
    pools.push(pool);
    uint256 pollIndex = pools.length - 1;
    emit PoolCreated(msg.sender, address(token), address(resultController), address(pool), pollIndex);
    return pollIndex;
  }
}