// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import {IResultController} from "./IResultController.sol";
import {IYieldSource} from "./IYieldSource.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BettingPool is Ownable {

  event poolLocked(
    address indexed poolAddress,
    uint256 indexed poolBalance
  );

  event betPlaced(
    address indexed user,
    uint256 indexed option,
    uint256 indexed amount
  );

  event userWithdraw(
    address indexed user,
    uint256 indexed amount
  );

  // Status  public status;
  bool public openForBets;
  IERC20 public token;
  IResultController public resultController;
  IYieldSource public yieldSrc;

  mapping(address => mapping(uint256 => uint256)) public bets; // user => option => amount
  mapping(address => bool) public withdrawals; // user => already withdrew
  mapping(uint256 => uint256) public optionTotalBets; // option => amount

  modifier onlyIfOpen() {
    require(
      openForBets,
      "Pool is closed now"
    );
    _;
  }

  constructor (address _owner, 
               address _token,
               address _resultController,
               address _yieldSrc) {
    token = IERC20(_token);
    resultController = IResultController(_resultController);
    yieldSrc = IYieldSource(_yieldSrc);
    openForBets = true;
    token.approve(_yieldSrc, type(uint256).max);
    transferOwnership(_owner);
  }

  function lockPool () public onlyIfOpen() onlyOwner() {
    openForBets = false;
    // deposit on the yield source
    yieldSrc.deposit(token.balanceOf(address(this)));
    // emit event
    emit poolLocked(address(this), token.balanceOf(address(this)));
  }

  function bet (uint256 option, uint256 amount) external onlyIfOpen() {
    // checks
    require(option < getOptionsCount(), "Invalid options.");
    
    // effects
    bets[msg.sender][option] += amount;
    optionTotalBets[option] += amount;

    // interactions
    // TODO: any additional security check?
    token.transferFrom(msg.sender, address(this), amount);
    // emit event
    emit betPlaced(msg.sender, option, amount);
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
    uint256 amount = getUserBalance(msg.sender);
    yieldSrc.withdraw(msg.sender, amount);
    // emit event
    emit userWithdraw (msg.sender, amount);
  }

  function getUserBalance (address user) public view returns(uint256) {
    // TODO: return zero after the withdraw?
    return getUserPrincipal(user) + getUserProfit(user);
  }

  function getUserProfit (address user) public view returns(uint256) {
    if(!hasResult()) {
      return 0;
    }
    uint256 result = getResult();
    // TODO: check phantom overflow (https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/FullMath.sol)
    return ( bets[user][result] * getTotalYield() ) / optionTotalBets[result];
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

  function totalAmount () public view returns (uint256) {
    uint256 count = getOptionsCount();
    uint256 amount = 0;
    for (uint i = 0; i<count; ++i) { 
      amount += optionTotalBets[i];
    }
    return amount;
  }

}
