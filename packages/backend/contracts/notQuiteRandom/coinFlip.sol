// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IResultController} from "../IResultController.sol";
import {NotQuiteRandom} from "./NotQuiteRandom.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract notQuiteRandomCoinFlip is IResultController, NotQuiteRandom, Ownable {
  bool private _hasResult;
  uint256 result;
  uint256 optionsCount;
  mapping(uint256 => bytes32) names;
  
  constructor (address owner) {
    _hasResult = false;
    optionsCount = 2;
    names[0] = bytes32(abi.encodePacked("Heads"));
    names[1] = bytes32(abi.encodePacked("Tails"));
    transferOwnership(owner);
  }

  function generateResult () external onlyOwner {
    require(!_hasResult, "Already has result");
    _hasResult = true;
    result = getRandomNumberFromInterval(2);
  }

  function hasResult () external view override returns (bool)  {
    return _hasResult;
  }
  
  function getResult () external view override returns (uint256) {
    return result;
  }

  function getOptionsCount () external view override returns (uint256) {
    return optionsCount;
  }
  
  function getOptionName (uint256 index) external view override returns (bytes32) {
    return names[index];
  }
}