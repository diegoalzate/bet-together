import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function ({getNamedAccounts, deployments, ethers, getChainId}: HardhatRuntimeEnvironment) {
  console.log("Deploying the betting pool");
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // const chainId = await getChainId();
  // if (chainId !== '80001') {
  //   return;
  // }

  let token: string | undefined;

  const chainId = await getChainId();
  switch (chainId) {
    case '80001': { // polygon mumbai
      token = "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2"
    }
    case '5': { // goerli
      token = "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43"; // USDC-TestnetMintableERC20-Aave
    }
  }

  const random = "0xB087848Ca9565995105a8aE803B33719bD395a7C"
  const args = [random, token, random, random];
  await deploy('BettingPool', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    args: args,
    from: deployer,
    log: true,
  });
};

export default main;
 
export const tags = ['all', 'BettingPool']