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
  
  const goerliUSDCTestnetMintableERC20Aave = '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43';
  const tokenContract = await getTokenContract(goerliUSDCTestnetMintableERC20Aave, signer);

  const beforeBalance = await tokenContract.balanceOf(signer.address);
  console.log("Balance before withdraw: ", ethers.utils.formatUnits(beforeBalance, 6));

  const tx = await poolContract.withdraw();
  console.log("Withdrawing funds tx: ", tx.hash);
  await tx.wait();
  
  const afterBalance = await tokenContract.balanceOf(signer.address);
  console.log("Balance after withdraw: ", ethers.utils.formatUnits(afterBalance, 6));

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});