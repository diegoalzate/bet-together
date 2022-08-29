import { Provider } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  getContract,
  reportGas,
  getContractFromAddress,
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
  console.log("Pool count", poolCount.toString());
  for (let i=0; i<poolCount.toNumber(); ++i) {
    const poolAddress = await contract.pools(i);
    const poolContract = getContractFromAddress("BettingPool", chainId, signer, poolAddress);
    printPool(poolContract);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});