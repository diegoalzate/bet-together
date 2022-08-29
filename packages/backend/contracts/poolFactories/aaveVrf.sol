// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IPoolAddressesProvider} from "../aave/external/IPoolAddressesProvider.sol";
import {aaveYieldSource} from "../aave/AaveYieldSource.sol";
import {VRFResultFactory} from "../vrf/factory.sol";
import {BettingPool} from "../bettingPool.sol";
import {BettingPoolFactory} from "../bettingPoolFactory.sol";

contract aaveVrfBettingPoolFactory {
  BettingPoolFactory public bettingPoolFactory;
  IPoolAddressesProvider public aaveAddressProvider;
  VRFResultFactory public vrfFactory;

  constructor (address factory, address _aaveAddressProvider, address _vrfFactory) {
    bettingPoolFactory = BettingPoolFactory(factory);
    aaveAddressProvider = IPoolAddressesProvider(_aaveAddressProvider);
    vrfFactory = VRFResultFactory(_vrfFactory);
  }

  function createCoinFlipPool (address token) external returns(uint256) {
    address controller = vrfFactory.createCoinFlipController(msg.sender);
    aaveYieldSource yieldSource = new aaveYieldSource(token, address(aaveAddressProvider));
    // uint256 poolIndex = bettingPoolFactory.createPool(token, controller, address(yieldSource));
    // bettingPoolFactory.pools[poolIndex].transferOwnership(msg.sender);
    return _createPool(token, controller, address(yieldSource));
  }

  function createWorldCupPool (address token) external returns(uint256) {
    address controller = vrfFactory.createWorldCupController(msg.sender);
    aaveYieldSource yieldSource = new aaveYieldSource(token, address(aaveAddressProvider));
    return _createPool(token, controller, address(yieldSource));
  }

  function _createPool (address token, address controller, address yieldSrc) internal returns(uint256){
    uint256 poolIndex = bettingPoolFactory.createPool(token, controller, yieldSrc);
    // bettingPoolFactory.pools[poolIndex].transferOwnership(msg.sender);
    BettingPool pool = bettingPoolFactory.pools(poolIndex);
    pool.transferOwnership(msg.sender);
    return poolIndex;
  }
  
}