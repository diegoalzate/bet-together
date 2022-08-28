import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function ({getNamedAccounts, deployments, getChainId, ethers}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const BettingPoolFactory = await deployments.get('BettingPoolFactory');

  const chainId = await getChainId();
  let aaveAddressProvider: string | undefined;
  switch (chainId) {
    case '80001': { // polygon mumbai
      aaveAddressProvider = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6";
    }
    case '5': { // goerli
      aaveAddressProvider = "0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D";
    }
  }

  const args = [BettingPoolFactory.address, aaveAddressProvider];
  await deploy('aaveFakeWorldCupBettingPoolFactory', {
    args: args,
    from: deployer,
    log: true,
  });
};

export default main;
 
export const tags = ['all', 'BettingPoolFactory', 'aaveFakeWorldCupBettingPoolFactory']