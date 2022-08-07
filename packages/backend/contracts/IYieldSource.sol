// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IYieldSource {
  function deposit (uint256 amount) external;
  function getBalance () external view returns (uint256);
  function getYield () external view returns (uint256);
  function withdraw (address to, uint256 amount) external;
}