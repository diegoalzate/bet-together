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

  const poolCount = await contract.poolCount();
  console.log("Pool Count", poolCount.toString());
  const poolAddress = await contract.pools(poolCount.toNumber() - 1); // can be a script parameter
  const poolContract = getContractFromAddress("BettingPool", chainId, signer, poolAddress);

  // const tx = await poolContract.lockPool();
  // console.log("Locking Pool tx: ", tx.hash);
  // await tx.wait();

  const resultControllerAddress = await poolContract.resultController();
  console.log('resultControllerAddress', resultControllerAddress);
  const resultController = await getContractFromAddress("notQuiteRandomCoinFlip", chainId, signer, resultControllerAddress);
  const tx = await resultController.generateResult();
  console.log("Generating result tx: ", tx.hash);
  await tx.wait();
  
  printPool(poolContract);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});