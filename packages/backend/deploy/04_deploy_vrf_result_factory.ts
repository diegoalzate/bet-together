import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function ({getNamedAccounts, deployments, getChainId, ethers}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let coordAddress: string | undefined;
  let subId: string | undefined;
  
  const chainId = await getChainId();
  switch (chainId) {
    case '80001': {
      coordAddress = "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed";
      subId = "1519";
    }
  }

  const args = [coordAddress, subId];
  await deploy('VRFResultFactory', {
    args: args,
    from: deployer,
    log: true,
  });

  const {owner} = await getNamedAccounts();
  const VRFResultFactory = await deployments.get('VRFResultFactory');
  const BettingPoolFactory = await ethers.getContract('BettingPoolFactory', owner);
  const tx = await BettingPoolFactory.setVrfFactory(VRFResultFactory.address);
  await tx.wait();
};

export default main;
 
export const tags = ['all', 'VRFResultFactory']