import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("BettingPool", function () {
  let poolFactoryFactory: any;
  let poolFactoryContract: any;
  let tokenContractFactory: any;
  let tokenContract: any;
  let fakeCoinFlipContract: any;
  let notQuiteRandomCoinFlipContract: any;
  let vrfCoinFlipContract: any;
  let vrfResultFactoryContract: any;
  let hardhatVrfCoordinatorV2Mock: any;
  let yieldContract: any;
  let accounts: SignerWithAddress[];
  let totalPoolCount = 0;

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

  const placeBet = async (pool: number, account: SignerWithAddress, option:number, amount:number) => {
    const poolContract = await getPoolContract(pool);
    await approve(account, poolContract.address, amount);
    const connectedPoolContract = poolContract.connect(account);
    const tx = await connectedPoolContract.bet(option, amount);
    await tx.wait();
    const principal = await connectedPoolContract.getUserPrincipal(account.address);
    expect(principal).to.equal(amount);
  }

  const lockPool = async (pool: number) => {
    const poolContract = await getPoolContract(pool);
    const tx = await poolContract.lockPool();
    await tx.wait();
    await expect(
      poolContract.bet(0, 10)
    ).to.be.revertedWith("Pool is closed");
    
  }

  const generateFakeResult = async (option: number) => {
    const contract = fakeCoinFlipContract;
    const beforeHasResult = await contract.hasResult();
    expect(beforeHasResult).to.equal(false);
    const tx = await contract.generateResult(option);
    await tx.wait();
    const afterHasResult = await contract.hasResult();
    expect(afterHasResult).to.equal(true);
    const result = await contract.getResult();
    expect(result).to.equal(option);
  }

  const generateNotQuiteRandomResult = async () => {
    const contract = notQuiteRandomCoinFlipContract;
    const beforeHasResult = await contract.hasResult();
    expect(beforeHasResult).to.equal(false);
    const tx = await contract.generateResult();
    await tx.wait();
    const afterHasResult = await contract.hasResult();
    expect(afterHasResult).to.equal(true);
    const result = await contract.getResult();
  }

  const generateVRFResult = async () => {
    const contract = vrfCoinFlipContract;
    const beforeHasResult = await contract.hasResult();
    expect(beforeHasResult).to.equal(false);
    const tx = await contract.generateResult();
    await tx.wait();
    // mock fulfill
    let {events} = await tx.wait();
    let [requestId] = events.filter( (x: any) => x.event === 'resultGenerationRequested')[0].args;
    const fulfillTx = await hardhatVrfCoordinatorV2Mock.fulfillRandomWords(requestId, vrfResultFactoryContract.address);
    await fulfillTx.wait();
    //check result
    const afterHasResult = await contract.hasResult();
    expect(afterHasResult).to.equal(true);
    const result = await contract.getResult();
  }

  const withdraw = async (pool: number, account: SignerWithAddress) => {
    const connectedToken = await tokenContract.connect(account);
    const beforeTokenBalance = await connectedToken.balanceOf(account.address);
    const poolContract = await getPoolContract(pool);
    const connectedPoolContract = poolContract.connect(account);
    const poolBalance = await connectedPoolContract.getUserBalance(account.address);
    const tx = await connectedPoolContract.withdraw();
    await tx.wait();
    const afterTokenBalance = await connectedToken.balanceOf(account.address);
    await expect(afterTokenBalance).to.equal(beforeTokenBalance + poolBalance);
  }

  const deployPoolFactory = async () => {
    poolFactoryFactory = await ethers.getContractFactory("BettingPoolFactory");
    poolFactoryContract = await poolFactoryFactory.deploy();
    await poolFactoryContract.deployed();
  }

  const deployToken = async () => {
    tokenContractFactory = await ethers.getContractFactory("MyToken");
    tokenContract = await tokenContractFactory.deploy();
    await tokenContract.deployed();
  }

  const deployFakeCoinFlip = async () => {
    const coinFlipFactory = await ethers.getContractFactory("fakeCoinFlip")
    fakeCoinFlipContract =  await coinFlipFactory.deploy();
    await fakeCoinFlipContract.deployed();
  }

  const deployYieldContract = async () => {
    const yieldFactory = await ethers.getContractFactory("fakeYieldSource")
    yieldContract =  await yieldFactory.deploy(tokenContract.address);
    await yieldContract.deployed();
  }

  const deployNotQuiteRandom = async () => {
    const notQuiteRandomFactoryFactory = await ethers.getContractFactory("notQuiteRandomFactory");
    const notQuiteRandomFactoryContract = await notQuiteRandomFactoryFactory.deploy();
    await notQuiteRandomFactoryContract.deployed();
    const tx = await notQuiteRandomFactoryContract.createCoinFlip();
    await tx.wait();
   
    const coinFlipFactory = await ethers.getContractFactory("notQuiteRandomCoinFlip");
    let coinFlipAddress = await notQuiteRandomFactoryContract.coinFlipControllers(0);
    notQuiteRandomCoinFlipContract = coinFlipFactory.attach(coinFlipAddress);
  }

  const createFakePool  = async () => {
    let tx = await poolFactoryContract.createPool(tokenContract.address,
                                                  fakeCoinFlipContract.address,
                                                  yieldContract.address);
    await tx.wait();
    totalPoolCount++;
  }

  const createNotQuiteRandomPool = async () => {
    const tx = await poolFactoryContract.createNotQuiteRandomPool(tokenContract.address);
    await tx.wait();
    // get pool contract
    const poolCount = await poolFactoryContract.poolCount(); 
    const pollContract = await getPoolContract(poolCount - 1);
    // get coinFlip contract from the pool
    const coinFlipFactory = await ethers.getContractFactory("notQuiteRandomCoinFlip");
    const coinFlipAddress = await pollContract.resultController();
    notQuiteRandomCoinFlipContract = coinFlipFactory.attach(coinFlipAddress);
    totalPoolCount++;
  }

  const deployVRFResultFactory = async () => {
    const vrfResultFactoryFactory = await ethers.getContractFactory("VRFResultFactory");
    const vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(0, 0);
    await hardhatVrfCoordinatorV2Mock.createSubscription();
    await hardhatVrfCoordinatorV2Mock.fundSubscription(1, ethers.utils.parseEther("7"))
    vrfResultFactoryContract = await vrfResultFactoryFactory.deploy(hardhatVrfCoordinatorV2Mock.address, 1);
    let tx = await hardhatVrfCoordinatorV2Mock.addConsumer(1, vrfResultFactoryContract.address);
    await tx.wait();
    tx = await poolFactoryContract.setVrfFactory(vrfResultFactoryContract.address);
    await tx.wait();
  }
  
  const createVRFPool = async () => {
    const tx = await poolFactoryContract.createVRFPool(tokenContract.address);
    await tx.wait();
    // get pool contract
    const poolCount = await poolFactoryContract.poolCount(); 
    const pollContract = await getPoolContract(poolCount - 1);
    const coinFlipFactory = await ethers.getContractFactory("VRFCoinFlip");
    const coinFlipAddress = await pollContract.resultController();
    vrfCoinFlipContract = coinFlipFactory.attach(coinFlipAddress);
    totalPoolCount++;
  }

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    // deploy factory
    await deployPoolFactory();
    // check 0 pools
    const poolCount = await poolFactoryContract.poolCount(); 
    expect(poolCount).to.equal(0);
    // deploy token
    await deployToken();
    // deploy fake coinflip
    await deployFakeCoinFlip();
    // deploy fake yieldsource
    await deployYieldContract();
    // create first pool (fake)
    await createFakePool()
    // // create second pool (notQuiteRandom)
    await createNotQuiteRandomPool();
    // await createDefaultPool();
    // create third pool
    await deployVRFResultFactory();
    await createVRFPool();
  });

  it ("Check pool count", async () => {
    const poolCount = await poolFactoryContract.poolCount(); 
    expect(poolCount).to.equal(totalPoolCount);
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

  it("Genrate Fake Results test", async () => {
    await generateFakeResult(0);
  })

  it("Genrate NotQuiteRandom Results test", async () => {
    await generateNotQuiteRandomResult();
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

  const simplePoolTest = (poolIndex: number, generateResultCB: Function) => {
    return async () => {
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
        await placeBet(poolIndex, accounts[index], option, amount);
      }

      await lockPool(poolIndex);

      await generateResultCB();

      const poolContract = await getPoolContract(poolIndex);
      const result = await poolContract.getResult();
      for (let index=0; index< len; ++index ) {
        await withdraw(poolIndex, accounts[index]);
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
    }
  }

  it("Simple fake pool test", simplePoolTest(0, async () => {await generateFakeResult(0);}));
  it("Simple notQuiteRandom pool test", simplePoolTest(1, async () => {await generateNotQuiteRandomResult();}));
  it("Simple vrf pool test", simplePoolTest(2, async () => {await generateVRFResult();}));
});

describe("VRFMock", function () {
  let owner: SignerWithAddress;
  let vrfResultFactoryContract: any, hardhatVrfCoordinatorV2Mock: any;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    let vrfResultFactoryFactory = await ethers.getContractFactory("VRFResultFactory");
    let vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");

    hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(0, 0);

    await hardhatVrfCoordinatorV2Mock.createSubscription();

    await hardhatVrfCoordinatorV2Mock.fundSubscription(1, ethers.utils.parseEther("7"))

    vrfResultFactoryContract = await vrfResultFactoryFactory.deploy(hardhatVrfCoordinatorV2Mock.address, 1);
    
    const tx = await hardhatVrfCoordinatorV2Mock.addConsumer(1, vrfResultFactoryContract.address);
    await tx.wait();
  })

  it("Simple vrf controller test", async () =>{
    const accounts = await ethers.getSigners();
    const createTx = await vrfResultFactoryContract.createCoinFlipController(accounts[0].address);
    let { events } = await createTx.wait();
    // console.log(events);
    let [owner, vrfResultControllerAddress] = events.filter( (x: any) => x.event === 'coinFlipCreated')[0].args;
    // console.log("address", vrfResultControllerAddress);
    const VRFCoinFlipFactory = await ethers.getContractFactory("VRFCoinFlip");
    const VRFCoinFlip = VRFCoinFlipFactory.attach(vrfResultControllerAddress);
    const generateResultTx = await VRFCoinFlip.generateResult();
    let {events: generateResultEvents} = await generateResultTx.wait();
    // console.log(generateResultEvents);
    let [requestId] = generateResultEvents.filter( (x: any) => x.event === 'resultGenerationRequested')[0].args;
    const beforeHasResult = await VRFCoinFlip.hasResult();
    expect(beforeHasResult).to.equal(false);
    const fulfillTx = await hardhatVrfCoordinatorV2Mock.fulfillRandomWords(requestId, vrfResultFactoryContract.address);
    const afterHasResult = await VRFCoinFlip.hasResult();
    expect(afterHasResult).to.equal(true);
  })
})