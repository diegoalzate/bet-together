import { Provider } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  getContract,
  reportGas,
  getContractFromAddress,
  getTokenContract,
  printPool,
  // getTokenContract,
  // saveAddress,
  // convertStringArrayToBytes32
} from "./utils";

async function main() {
  console.log("Main!");
  const provider = setupProvider("goerli");
  // console.log(provider);
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  // const provider = setupProvider();
  const signer = wallet.connect(provider as Provider);
  await checkBalance(signer);

  // console.log(contracts);

  const chainId = '5'; // goerli
  const contract = getContract("BettingPoolFactory", chainId, signer);

  const amount = ethers.utils.parseUnits("10", 6);
  const approveAmount = ethers.utils.parseUnits("20", 6);
  
  const poolCount = await contract.poolCount();
  console.log("Pool Count", poolCount.toString());
  const poolAddress = await contract.pools(poolCount.toNumber() - 1); // can be a script parameter
  const poolContract = getContractFromAddress("BettingPool", chainId, signer, poolAddress);
  
  const goerliUSDCTestnetMintableERC20Aave = '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43';
  const tokenContract = await getTokenContract(goerliUSDCTestnetMintableERC20Aave, signer);
  const approveTx = await tokenContract.approve(poolAddress, approveAmount);
  console.log("Approving transfer tx ",  approveTx.hash);
  await approveTx.wait();
  
  const bet0Tx = await poolContract.bet(0, amount);
  console.log("Betting on first option tx: ", bet0Tx.hash);
  await bet0Tx.wait();

  const bet1Tx = await poolContract.bet(1, amount);
  console.log("Betting on second option tx: ", bet1Tx.hash);
  await bet1Tx.wait();

  printPool(poolContract);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});