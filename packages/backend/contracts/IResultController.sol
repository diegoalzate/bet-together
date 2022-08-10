// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IResultController {
  event resultGenerated (address indexed controller, uint256 indexed result);
  function hasResult () external view returns (bool);
  function getResult () external view returns (uint256);
  function getOptionsCount () external view returns (uint256);
  function getOptionName (uint256 index) external view returns (bytes32);
}