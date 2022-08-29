// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IYieldSource} from "../IYieldSource.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolAddressesProvider} from "./external/IPoolAddressesProvider.sol";
import {IPool} from "./external/IPool.sol";
import {DataTypes} from './external/DataTypes.sol';
import "hardhat/console.sol";

contract aaveYieldSource is IYieldSource {
  IERC20 public token;
  IERC20 public aToken;
  IPoolAddressesProvider public aaveAddressProvider;

  uint256 amountDeposited;
  uint256 amountWithdrawn;
  
  constructor (address _token, address _aaveAddressProvider) {
    // TODO: check addresses not zero?
    // TODO: check if token is compatible with aave
    token = IERC20(_token);
    aaveAddressProvider = IPoolAddressesProvider(_aaveAddressProvider);
    IPool pool = _getPool();
    DataTypes.ReserveData memory data = pool.getReserveData(_token);
    aToken = IERC20(data.aTokenAddress);
    token.approve(address(pool), type(uint256).max);
    amountDeposited = 0;
    amountWithdrawn = 0;
  }
  
  function deposit (uint256 amount) external override {
    amountDeposited += amount;
    token.transferFrom(msg.sender, address(this), amount);
    _getPool().supply(address(token), amount, address(this), 0);
  }

  function getBalance () external view override returns (uint256) {
    return _getBalance();
  }

  function getYield () external view override returns (uint256) {
    return _getBalance() + amountWithdrawn - amountDeposited;
  }

  function withdraw (address to, uint256 amount) external override {
    amountWithdrawn += amount;
    _getPool().withdraw(address(token), amount, to);
  }

  function _getPool() internal view returns (IPool) {
    return IPool(aaveAddressProvider.getPool());
  }

  function _getBalance() internal view returns(uint256) {
    return aToken.balanceOf(address(this));
  }
}