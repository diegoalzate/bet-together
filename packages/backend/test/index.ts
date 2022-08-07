import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("BettingPool", function () {
  let poolFactoryFactory: any;
  let poolFactoryContract: any;
  let tokenContractFactory: any;
  let tokenContract: any;
  let accounts: SignerWithAddress[];

  const getPoolContract = async (index: any) => { // BigNumberish
    const bettingPoolFactory = await ethers.getContractFactory("BettingPool");
    let poolAddress = await poolFactoryContract.pools(index);
    return bettingPoolFactory.attach(poolAddress);
  }

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    // deploy factory
    poolFactoryFactory = await ethers.getContractFactory("BettingPoolFactory");
    poolFactoryContract = await poolFactoryFactory.deploy();
    await poolFactoryContract.deployed();
    // check 0 pools
    const poolCount = await poolFactoryContract.poolCount(); 
    expect(poolCount).to.equal(0);
    // deploy token
    tokenContractFactory = await ethers.getContractFactory("MyToken");
    tokenContract = await tokenContractFactory.deploy();
    await tokenContract.deployed();
    // deploy fake coinflip
    const coinFlipFactory = await ethers.getContractFactory("fakeCoinFlip")
    const coinFlipContract =  await coinFlipFactory.deploy();
    await coinFlipContract.deployed();
    // deploy fake coinflip
    const yieldFactory = await ethers.getContractFactory("fakeYieldSource")
    const yieldContract =  await yieldFactory.deploy(tokenContract.address);
    await yieldContract.deployed();
    // crete first pool
    const tx = await poolFactoryContract.createPool(tokenContract.address,
                                                    coinFlipContract.address,
                                                    yieldContract.address);
    await tx.wait();
  });

  it ("Check pool count", async () => {
    const poolCount = await poolFactoryContract.poolCount(); 
    expect(poolCount).to.equal(1);
  })

  it("Check pool", async () => {
    const poolContract = await getPoolContract(0);
    const open = await poolContract.openForBets();
    expect(open).to.equal(true); // open
  })

  // TODO: move mint test to different test script
  it("Token mint test", async () => {
    const amount = 10;
    const address = accounts[0].address;
    const tx = await tokenContract.mint(address, amount);
    await tx.wait();
    const balance = await tokenContract.balanceOf(address);
    expect(balance).to.equal(amount); // open
  })

  // it("Simple pool test", async () => {
  //   // mint players tokens
  //   const initialTokenBalances = [10, 20, 30, 40];
  //   // console.log(accounts[0]);
  //   const tx = await tokenContract.mint(accounts[0], initialTokenBalances[0]);
  //   // for (let i = 0; i<initialTokenBalances.length; ++i) {
  //   //   const tx = await tokenContract.mint(accounts[i], initialTokenBalances[i]);
  //   //   await tx.wait();
  //   // }
  //   // for (let i = 0; i<initialTokenBalances.length; ++i) {

  //   // }
  // })
});
