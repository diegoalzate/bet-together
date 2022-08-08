import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("BettingPool", function () {
  let poolFactoryFactory: any;
  let poolFactoryContract: any;
  let tokenContractFactory: any;
  let tokenContract: any;
  let coinFlipContract: any;
  let yieldContract: any;
  let accounts: SignerWithAddress[];

  const getPoolContract = async (index: any) => { // BigNumberish
    const bettingPoolFactory = await ethers.getContractFactory("BettingPool");
    let poolAddress = await poolFactoryContract.pools(index);
    return bettingPoolFactory.attach(poolAddress);
  }

  const mint = async (account: SignerWithAddress, amount: number) => {
    const address = account.address;
    const tx = await tokenContract.mint(address, amount);
    await tx.wait();
    const balance = await tokenContract.balanceOf(address);
    expect(balance).to.equal(amount); // open
  }

  const approve = async (account: SignerWithAddress, address:string, amount:number) => {
    const connectedToken = await tokenContract.connect(account);
    const approveTx = await connectedToken.approve(address, amount);
    await approveTx.wait();
    const allowance = await connectedToken.allowance(account.address, address);
    await expect(allowance).to.equal(amount);
  }

  const placeBet = async (account: SignerWithAddress, option:number, amount:number) => {
    const poolContract = await getPoolContract(0);
    await approve(account, poolContract.address, amount);
    const connectedPoolContract = poolContract.connect(account);
    const tx = await connectedPoolContract.bet(option, amount);
    await tx.wait();
    const principal = await connectedPoolContract.getUserPrincipal(account.address);
    expect(principal).to.equal(amount);
  }

  const lockPool = async () => {
    const poolContract = await getPoolContract(0);
    const tx = await poolContract.lockPool();
    await tx.wait();
    await expect(
      poolContract.bet(0, 10)
    ).to.be.revertedWith("Pool is closed");
    
  }

  const generateResult = async (option: number) => {
    const beforeHasResult = await coinFlipContract.hasResult();
    expect(beforeHasResult).to.equal(false);
    const tx = await coinFlipContract.setResult(option);
    await tx.wait();
    const afterHasResult = await coinFlipContract.hasResult();
    expect(afterHasResult).to.equal(true);
    const result = await coinFlipContract.getResult();
    expect(result).to.equal(option);
  }

  const withdraw = async (account: SignerWithAddress) => {
    const connectedToken = await tokenContract.connect(account);
    const beforeTokenBalance = await connectedToken.balanceOf(account.address);
    const poolContract = await getPoolContract(0);
    const connectedPoolContract = poolContract.connect(account);
    const poolBalance = await connectedPoolContract.getUserBalance(account.address);
    const tx = await connectedPoolContract.withdraw();
    await tx.wait();
    const afterTokenBalance = await connectedToken.balanceOf(account.address);
    await expect(afterTokenBalance).to.equal(beforeTokenBalance + poolBalance);
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
    coinFlipContract =  await coinFlipFactory.deploy();
    await coinFlipContract.deployed();
    // deploy fake coinflip
    const yieldFactory = await ethers.getContractFactory("fakeYieldSource")
    yieldContract =  await yieldFactory.deploy(tokenContract.address);
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

  it("Token mint test", async () => {
    await mint(accounts[0], 10);
  })

  it("Approve test", async () => {
    const amount = 10;
    await mint(accounts[0], amount);
    await approve(accounts[0], accounts[1].address, amount);
  })

  it("Genrate Results test", async () => {
    await generateResult(0);
  })

  it("Fake yield test", async () => {
    const amount = 100;
    await mint(accounts[0], amount);
    await approve(accounts[0], yieldContract.address, amount);
    let tx = await yieldContract.deposit(100);
    await tx.wait();
    const balance = await yieldContract.getBalance();
    expect(balance).to.equal(110); // open
    tx = await yieldContract.withdraw(accounts[0].address, balance);
    await tx.wait();
    const afterWithdrawBalance = await tokenContract.balanceOf(accounts[0].address);
    expect(afterWithdrawBalance).to.equal(110);
  })

  it("Simple pool test", async () => {
    const initialBalances = [100, 200, 300, 400];
    const len = initialBalances.length;
    const bets = [0, 0, 1, 1];

    // mint players tokens
    for (let index=0; index< len; ++index ) {
      const amount = initialBalances[index];
      await mint(accounts[index], amount);
    }
    
    // place bets
    for (let index=0; index< len; ++index ) {
      const amount = initialBalances[index];
      const option = bets[index];
      await placeBet(accounts[index], option, amount);
    }

    await lockPool();

    await generateResult(0);

    const poolContract = await getPoolContract(0);
    const result = await poolContract.getResult();
    for (let index=0; index< len; ++index ) {
      await withdraw(accounts[index]);
      const address = accounts[index].address;
      const balance = await tokenContract.balanceOf(address);
      // check if principal was preserved
      expect(balance.toNumber()).to.greaterThanOrEqual(initialBalances[index]);
      const bet = await poolContract.bets(address, result);
      if (bet.toNumber() > 0) {
        // if user has a winning bet, his balance should be greater than the initial balance
        expect(balance.toNumber()).to.greaterThan(initialBalances[index]);
      }
    }

  })
});
