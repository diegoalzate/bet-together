// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IResultController} from "./IResultController.sol";

abstract contract baseResultController is IResultController {
  bool private _hasResult;
  uint256 public result;
  bytes32[] public optionNames;
  
  constructor () {
    _hasResult = false;
  }

  function setResult (uint256 r) internal {
    require(!_hasResult, "Already has result.");
    _hasResult = true;
    result = r;
    emit resultGenerated (address(this), result);
  }

  function setOptions (bytes32[] memory options) internal {
    optionNames = options;
  }

  function addOption (bytes32 optionName) internal {
    optionNames.push(optionName);
  }

  function hasResult () external view override returns (bool)  {
    return _hasResult;
  }
  
  function getResult () external view override returns (uint256)
  {
    return result;
  }

  function getOptionsCount () external view override returns (uint256) {
    return _getOptionsCount();
  }
  
  function getOptionName (uint256 index) external view override returns (bytes32) {
    return optionNames[index];
  }

  function _getOptionsCount () public view returns (uint256) {
    return optionNames.length;
  }

  function getGame () external view returns (bytes32) {
    return _getGame();
  }

  function _getGame () internal view virtual returns (bytes32);
}