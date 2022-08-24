import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function ({getNamedAccounts, deployments, getChainId, ethers}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let coordAddress: string | undefined;
  let subId: string | undefined;
  let keyHash: string | undefined;
  
  const chainId = await getChainId();
  switch (chainId) {
    case '80001': {
      coordAddress = "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed";
      subId = "1519";
      keyHash = "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f";
    }
    case '5': {
      coordAddress = "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d";
      subId = "341";
      keyHash = "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15";
    }
  }

  const args = [coordAddress, subId, keyHash];
  await deploy('VRFResultFactory', {
    args: args,
    from: deployer,
    log: true,
  });

  const {owner} = await getNamedAccounts();
  const VRFResultFactory = await deployments.get('VRFResultFactory');
  const BettingPoolFactory = await ethers.getContract('BettingPoolFactory', owner);
  const currentVrfFactory = await BettingPoolFactory.vrfFactory();
  console.log("current Address Provider ", currentVrfFactory);
  if (currentVrfFactory === VRFResultFactory.address) {
    console.log("vrf factory up to date.")
    return;
  }
  
  const tx = await BettingPoolFactory.setVrfFactory(VRFResultFactory.address);
  console.log("Updating vrffactory on the betting pool factory, tx.hash =", tx.hash);
  const txReceipt = await tx.wait();
};

export default main;
 
export const tags = ['all', 'VRFResultFactory']