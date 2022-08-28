// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IPoolAddressesProvider} from "../aave/external/IPoolAddressesProvider.sol";
import {aaveYieldSource} from "../aave/AaveYieldSource.sol";
import {VRFResultFactory} from "../vrf/factory.sol";
import {BettingPoolFactory} from "../bettingPoolFactory.sol";

contract aaveVrfCoinflipBettingPoolFactory {
  BettingPoolFactory public bettingPoolFactory;
  IPoolAddressesProvider public aaveAddressProvider;
  VRFResultFactory public vrfFactory;

  constructor (address factory, address _aaveAddressProvider, address _vrfFactory) {
    bettingPoolFactory = BettingPoolFactory(factory);
    aaveAddressProvider = IPoolAddressesProvider(_aaveAddressProvider);
    vrfFactory = VRFResultFactory(_vrfFactory);
  }

  function createPool (address token) external returns(uint256) {
    address controller = vrfFactory.createCoinFlipController(msg.sender);
    aaveYieldSource yieldSource = new aaveYieldSource(token, address(aaveAddressProvider));
    return bettingPoolFactory.createPool(token, controller, address(yieldSource));
  }
  
}