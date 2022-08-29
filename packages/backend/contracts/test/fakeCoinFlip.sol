// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {baseResultController} from "../baseResultController.sol";

contract fakeCoinFlip is baseResultController {
  
  constructor () {
    addOption(bytes32(abi.encodePacked("Heads")));
    addOption(bytes32(abi.encodePacked("Tails")));
  }

  function generateResult (uint256 r) external {
    setResult(r);
  }

  function _getGame () internal view override returns (bytes32)
  {
    return bytes32(abi.encodePacked("Coin Flip"));
  }

}
