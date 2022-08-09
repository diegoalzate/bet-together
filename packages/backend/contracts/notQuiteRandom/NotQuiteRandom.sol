// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract NotQuiteRandom {
    function getRandomNumber()
        public
        view
        returns (uint256 notQuiteRandomNumber)
    {
        notQuiteRandomNumber = uint256(blockhash(block.number - 1));
    }

    function getRandomNumberFromInterval(uint256 limit) public view returns (uint256 heads) {
        return getRandomNumber() % limit;
    }
}