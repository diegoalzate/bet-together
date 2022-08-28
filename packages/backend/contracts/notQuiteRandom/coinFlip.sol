// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {baseResultController} from "../baseResultController.sol";
import {NotQuiteRandom} from "./NotQuiteRandom.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract notQuiteRandomCoinFlip is baseResultController, NotQuiteRandom, Ownable {
  
  constructor (address owner) {
    addOption(bytes32(abi.encodePacked("Heads")));
    addOption(bytes32(abi.encodePacked("Tails")));
    transferOwnership(owner);
  }

  function generateResult () external onlyOwner {
    setResult(getRandomNumberFromInterval(2));
  }

  function _getGame () internal view override returns (bytes32)
  {
    return bytes32(abi.encodePacked("Coin Flip"));
  }
  
}