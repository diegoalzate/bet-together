// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {baseResultController} from "../baseResultController.sol";
import {baseVRFController} from "./baseVrfController.sol";

contract VRFCoinFlip is baseVRFController {

  constructor (address owner, address _wordsGenerator) baseVRFController(owner, _wordsGenerator) {
  }

  function _getGame () internal view override returns (bytes32)
  {
    return bytes32(abi.encodePacked("Coin Flip"));
  }

  function _addOptions () internal virtual override {
    addOption(bytes32(abi.encodePacked("Heads")));
    addOption(bytes32(abi.encodePacked("Tails")));
  }
  
}