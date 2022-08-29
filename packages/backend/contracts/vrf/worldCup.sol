// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {baseResultController} from "../baseResultController.sol";
import {baseVRFController} from "./baseVrfController.sol";

contract VRFWorldCup is baseVRFController {

  constructor (address owner, address _wordsGenerator) baseVRFController(owner, _wordsGenerator) {
  }

  function _getGame () internal view override returns (bytes32)
  {
    return bytes32(abi.encodePacked("World Cup"));
  }

  function _addOptions () internal override {
    addOption(bytes32(abi.encodePacked("Argentina")));
    addOption(bytes32(abi.encodePacked("Australia")));
    addOption(bytes32(abi.encodePacked("Belgium")));
    addOption(bytes32(abi.encodePacked("Brazil")));
    addOption(bytes32(abi.encodePacked("Cameroon")));
    addOption(bytes32(abi.encodePacked("Canada")));
    addOption(bytes32(abi.encodePacked("Costa Rica")));
    addOption(bytes32(abi.encodePacked("Croatia")));
    addOption(bytes32(abi.encodePacked("Denmark")));
    addOption(bytes32(abi.encodePacked("Ecuador")));
    addOption(bytes32(abi.encodePacked("England")));
    addOption(bytes32(abi.encodePacked("France")));
    addOption(bytes32(abi.encodePacked("Germany")));
    addOption(bytes32(abi.encodePacked("Ghana")));
    addOption(bytes32(abi.encodePacked("Iran")));
    addOption(bytes32(abi.encodePacked("Japan")));
    addOption(bytes32(abi.encodePacked("Mexico")));
    addOption(bytes32(abi.encodePacked("Morocco")));
    addOption(bytes32(abi.encodePacked("Netherlands")));
    addOption(bytes32(abi.encodePacked("Poland")));
    addOption(bytes32(abi.encodePacked("Portugal")));
    addOption(bytes32(abi.encodePacked("Qatar")));
    addOption(bytes32(abi.encodePacked("Saudi Arabia")));
    addOption(bytes32(abi.encodePacked("Senegal")));
    addOption(bytes32(abi.encodePacked("Serbia")));
    addOption(bytes32(abi.encodePacked("South Korea")));
    addOption(bytes32(abi.encodePacked("Spain")));
    addOption(bytes32(abi.encodePacked("Switzerland")));
    addOption(bytes32(abi.encodePacked("Tunisia")));
    addOption(bytes32(abi.encodePacked("United States")));
    addOption(bytes32(abi.encodePacked("Uruguay")));
    addOption(bytes32(abi.encodePacked("Wales")));
  }
  
}