// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {baseResultController} from "../baseResultController.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

interface RandomWordsGenerator {
  function requestRandomWords() external returns(uint256);
}

contract VRFCoinFlip is baseResultController, Ownable {
  RandomWordsGenerator public wordsGenerator;

  event resultGenerationRequested (uint256 indexed requestId);

  modifier onlyWordGenerator() {
    require(msg.sender == address(wordsGenerator), "Not the random word generator.");
    _;
  }

  constructor (address owner, address _wordsGenerator) {
    addOption(bytes32(abi.encodePacked("Heads")));
    addOption(bytes32(abi.encodePacked("Tails")));
    wordsGenerator = RandomWordsGenerator(_wordsGenerator);
    transferOwnership(owner);
  }

  function generateResult () external onlyOwner {
    uint256 requestId = wordsGenerator.requestRandomWords();
    emit resultGenerationRequested(requestId);
  }

  function setRandomWord (uint256 word) public onlyWordGenerator {
    uint256 result = word % _getOptionsCount();
    setResult(result);
  }

  function _getGame () internal view override returns (bytes32)
  {
    return bytes32(abi.encodePacked("Coin Flip"));
  }
  
}