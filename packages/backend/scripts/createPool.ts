
import { Provider } from "@ethersproject/abstract-provider";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  getContract,
  reportGas,
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
  
  //│ USDC-TestnetMintableERC20-Aave │ '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43' │
  const goerliUSDCTestnetMintableERC20Aave = '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43';
  const tx = await contract.createDefaultPool(goerliUSDCTestnetMintableERC20Aave);
  console.log("Awaiting confirmations");
  console.log("Transaction hash: ", tx.hash);
  const txReceipt = await tx.wait();
  reportGas(txReceipt);
  // console.log(txReceipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});