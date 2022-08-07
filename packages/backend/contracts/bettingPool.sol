// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import {IResultController} from "./IResultController.sol";
import {IYieldSource} from "./IYieldSource.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BettingPool { // use ownable?

  // Status  public status;
  bool public openForBets;
  address public owner;
  IERC20 public token;
  IResultController public resultController;
  IYieldSource public yieldSrc;

  mapping(address => mapping(uint256 => uint256)) public bets; // user => option => amount
  mapping(address => bool) public withdrawals; // user => already withdrew
  mapping(uint256 => uint256) public optionTotalBets; // option => amount

  modifier onlyIfOpen() {
    require(
      openForBets,
      "Pool is closed"
    );
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not the pool owner.");
    _;
  }

  constructor (address _owner, 
               address _token,
               address _resultController,
               address _yieldSrc) {
    owner = _owner;
    token = IERC20(_token);
    resultController = IResultController(_resultController);
    yieldSrc = IYieldSource(_yieldSrc);
    openForBets = true;
    token.approve(_yieldSrc, type(uint256).max);
  }

  function lockPool () public onlyIfOpen() onlyOwner() {
    openForBets = false;
    // deposit on the yield source
  }

  function bet (uint256 option, uint256 amount) external onlyIfOpen() {
    // checks
    require(option < getOptionsCount(), "Invalid options.");
    
    // effects
    bets[msg.sender][option] += amount;
    optionTotalBets[option] += amount;

    // interactions
    // TODO is this correct? should I transfer for this contract before transfering to the yield source?
      // yes, we only deposit it after the lock
    // TODO: any additional security check?
    token.transferFrom(msg.sender, address(this), amount);
  }

  function hasResult () public view returns(bool) {
    return resultController.hasResult();
  }

  function getResult () public view returns (uint256) {
    return resultController.getResult();
  }

  function getOptionsCount () public view returns(uint256) {
    return resultController.getOptionsCount();
  }

  function getOptionName (uint256 index) public view returns(bytes32) {
    return resultController.getOptionName(index);
  }

  function withdraw () external {
    // checks 
    require(hasResult(), "Pool not finished.");
    require(!(withdrawals[msg.sender]), "Already withdrew.");
    // effects
    withdrawals[msg.sender] = true;
    // interactions
    yieldSrc.withdraw(msg.sender, getUserBalance(msg.sender));
  }

  function getUserBalance (address user) public view returns(uint256) {
    return getUserPrincipal(user) + getUserProfit(user);
  }

  function getUserProfit (address user) public view returns(uint256) {
    if(!hasResult()) {
      return 0;
    }
    uint256 result = getResult();
    return ( bets[user][result] / optionTotalBets[result] ) * getTotalYield();
  }

  function getUserPrincipal (address user) public view returns(uint256) {
    uint256 count = getOptionsCount();
    // assuming small number of options
    uint256 principal = 0;
    for (uint i = 0; i<count; ++i) { 
      principal += bets[user][i];
    }
    return principal;
  }

  function getTotalYield () public view returns(uint256) {
    return yieldSrc.getYield(); // TODO: get yield from yieldSource
  }

}
