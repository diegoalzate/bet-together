// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {VRFCoinFlip} from "./coinflip.sol";

contract VRFResultFactory is VRFConsumerBaseV2, Ownable {
  VRFCoordinatorV2Interface COORDINATOR;
  uint64 s_subscriptionId;
  mapping(address => bool) consumers;
  mapping(uint256 => address) requestToConsumers;

  bytes32 keyHash =
      0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f; // TODO: Should be parameter
  uint32 callbackGasLimit = 300000;
  uint16 requestConfirmations = 3;
  uint32 numWords = 2;

  event randomWordsRequested(address indexed consumer, uint256 indexed requestId);
  event coinFlipCreated(address indexed owner, address indexed newCoinFlip);

  modifier onlyConsumer() {
    require(
      consumers[msg.sender],
      "Not consumer."
    );
    _;
  }
  
  constructor(address vrfCoordinator, uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    s_subscriptionId = subscriptionId;
  }
  
  // Assumes the subscription is funded sufficiently.
  function requestRandomWords() external onlyConsumer returns(uint256) {
    // Will revert if subscription is not set and funded.
    uint256 s_requestId = COORDINATOR.requestRandomWords(
        keyHash,
        s_subscriptionId,
        requestConfirmations,
        callbackGasLimit,
        numWords
    );
    requestToConsumers[s_requestId] = msg.sender;
    emit randomWordsRequested(msg.sender, s_requestId);
    return s_requestId;
  }

  function fulfillRandomWords(
      uint256 requestId,
      uint256[] memory randomWords
  ) internal override {
      VRFCoinFlip(requestToConsumers[requestId]).setRandomWord(randomWords[0]);
  }

  // TODO make it generic random game
  function createCoinFlipController () public returns(address) {
    VRFCoinFlip c = new VRFCoinFlip(msg.sender, address(this));
    address newCoinFlipAddr = address(c);
    consumers[newCoinFlipAddr] = true;
    emit coinFlipCreated(msg.sender, newCoinFlipAddr);
    return newCoinFlipAddr;
  }

}