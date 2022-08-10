/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { useContractRead, useContractWrite } from "wagmi";
import { NETWORK_ID, USDC_TESTNETMINTABLE_POLYGON } from "@/config";
import contracts from "@/contracts/hardhat_contracts.json";

type Pool = {
  address: string;
  game: string;
  yieldTime: string;
  status: boolean;
  amount: number;
  coin: string;
};
const chainId = Number(NETWORK_ID);
const allContracts = contracts as any;
console.log(allContracts[chainId]);
const bettingPoolFactoryAddress =
  allContracts[chainId][0].contracts.BettingPoolFactory.address;
const bettingPoolFactoryABI =
  allContracts[chainId][0].contracts.BettingPoolFactory.abi;
const Pool = () => {
  const { data: poolCount, isLoading: poolCountIsLoading } = useContractRead({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "poolCount",
  });
  const {
    data: createdPool,
    write,
    isSuccess,
    isLoading: createIsLoading,
  } = useContractWrite({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "createDefaultPool",
    args: [USDC_TESTNETMINTABLE_POLYGON],
  });
  console.log(poolCount?.toString());
  const bets = [
    {
      game: "Coin Flip",
      yieldTime: "30 days",
      status: true,
      amount: 100,
      coin: "USDC",
    },
    {
      game: "Coin Flip",
      yieldTime: "30 days",
      status: false,
      amount: 100,
      coin: "USDC",
    },
    {
      game: "Coin Flip",
      yieldTime: "30 days",
      status: true,
      amount: 100,
      coin: "MATIC",
    },
  ];
  return (
    <>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between">
          <h2 className="text-5xl font-bold text-white">Betting pools</h2>
          <button
            className="btn bg-pBlue text-white"
            onClick={() => {
              write();
            }}
          >
            create pool
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Game</th>
                <th>Yield time</th>
                <th>Status</th>
                <th>Amount betted</th>
              </tr>
            </thead>
            <tbody>
              {[...Array.from({ length: +(poolCount?.toString() ?? 0) })].map(
                (item, i) => (
                  <PoolRow key={i} index={i} />
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const PoolRow = (props: { index: number }) => {
  const {
    data: pool,
    isError,
    isLoading: poolsIsLoading,
  } = useContractRead({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "pools",
    args: [props.index],
  });
  console.log(pool);
  return (
    <Link href={`/pool/${pool?.address}`}>
      <tr className="hover">
        {pool?.address}
        {/* <th>{item.game}</th>
                    <td>{item.yieldTime}</td>
                    <td>{item.status ? "Open" : "Closed"}</td>
                    <td>{`${item.amount} ${item.coin}`}</td> */}
      </tr>
    </Link>
  );
};

export default Pool;
