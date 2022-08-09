// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import {notQuiteRandomCoinFlip} from "./coinFlip.sol";


contract notQuiteRandomFactory {
  notQuiteRandomCoinFlip[] public coinFlipControllers;

  event CoinFlipCreated(
    address indexed owner
  );

  function createCoinFlip () external returns(uint256) {
    notQuiteRandomCoinFlip controller = new notQuiteRandomCoinFlip(msg.sender);
    coinFlipControllers.push(controller);
    emit CoinFlipCreated(msg.sender);
    return coinFlipControllers.length - 1;
  }

  function coinFlipCount () public view returns(uint256) {
    return coinFlipControllers.length;
  }
}
