// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IPoolAddressesProvider} from "../aave/external/IPoolAddressesProvider.sol";
import {aaveYieldSource} from "../aave/AaveYieldSource.sol";
import {fakeWorldCup} from "../test/fakeWorldCup.sol";
import {BettingPoolFactory} from "../bettingPoolFactory.sol";

contract aaveFakeWorldCupBettingPoolFactory {
  BettingPoolFactory public bettingPoolFactory;
  IPoolAddressesProvider public aaveAddressProvider;

  constructor (address factory, address _aaveAddressProvider) {
    bettingPoolFactory = BettingPoolFactory(factory);
    aaveAddressProvider = IPoolAddressesProvider(_aaveAddressProvider);
  }

  function createPool (address token) external returns(uint256) {
    fakeWorldCup controller = new fakeWorldCup(msg.sender);
    aaveYieldSource yieldSource = new aaveYieldSource(token, address(aaveAddressProvider));
    return bettingPoolFactory.createPool(token, address(controller), address(yieldSource));
  }
  
}