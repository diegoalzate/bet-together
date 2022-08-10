import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function ({getNamedAccounts, deployments}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const random = "0xB087848Ca9565995105a8aE803B33719bD395a7C"
  const token = "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2"
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