import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function ({getNamedAccounts, deployments}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const random = "0xB087848Ca9565995105a8aE803B33719bD395a7C"
  const args = [random];
  await deploy('notQuiteRandomCoinFlip', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    args: args,
    from: deployer,
    log: true,
  });
};

export default main;
 
export const tags = ['all', 'notQuiteRandomCoinFlip']