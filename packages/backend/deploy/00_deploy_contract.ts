import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function ({getNamedAccounts, deployments, ethers, getChainId}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // const args = ['Hello!!!!!!!!'];
  await deploy('BettingPoolFactory', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    // args: args,
    from: deployer,
    log: true,
  });

  // const {owner} = await getNamedAccounts();
  // const BettingPoolFactory = await ethers.getContract('BettingPoolFactory', owner);

  // let aaveAddressProvider: string | undefined;
  
  // const chainId = await getChainId();
  // switch (chainId) {
  //   case '80001': { // polygon mumbai
  //     aaveAddressProvider = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6";
  //   }
  //   case '5': { // goerli
  //     aaveAddressProvider = "0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D";
  //   }
  // }

  // if (aaveAddressProvider) {
  //   const currentAddressProvider = await BettingPoolFactory.aaveAddressProvider();
  //   console.log("current Address Provider ", currentAddressProvider);
  //   if (currentAddressProvider === aaveAddressProvider) {
  //     console.log("Address Provider up to date")
  //     return;
  //   }
  //   const tx = await BettingPoolFactory.setAaveAddressProvider(aaveAddressProvider);
  //   console.log("Setting aave address provider: tx.hash = ", tx.hash);
  //   await tx.wait();
  //   console.log("Transaction confirmed.");
  // }
  
};

export default main;
 
export const tags = ['all', 'BettingPoolFactory'];
