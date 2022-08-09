// SPDX-License-Identifier: MIT

// // How to use on Frontend:
// import abi from './utils/VRF2.json'
// const contractAddressVRF = 0x2cb1ebc4e9f90e8ec693e42560540b28a0f71aaa  //(On Mumbai)
// const abiVRF = abi.abi
// const provider = new ethers.providers.Web3Provider(window.ethereum)
// const signer = provider.getSigner()
// const contractVRF = new ethers.Contract( contractAddressVRF, abiVRF, signer)

// // Step 1: GENERATE RANDOM NUMBER: 
//   await contract.requestRandomWords()
//
// // Step 2: RETREIVE RANDOM NUMBER between min and max: min + rand % (max - min + 1) 
// // let min = 0 and max = 1 therefore modulus = (1 - 0 + 1) = 2
// let randomOne = await contract.s_randomWords( 0 ) % 2 // where: s_randomWords is an array with elements 0 and 1
// let randomTwo = await contract.s_randomWords( 1 ) % 2

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract VRFv2Consumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    uint64 s_subscriptionId;
    address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;
    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 300000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 2;

    uint256[] public s_randomWords;
    uint256 public s_requestId;
    address s_owner;

    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords() public {
        // Will revert if subscription is not set and funded.
        s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }
}
