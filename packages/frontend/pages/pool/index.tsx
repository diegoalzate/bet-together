/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { useContract, useContractRead, useContractWrite, useSigner } from "wagmi";
import { NETWORK_ID, USDC_TESTNETMINTABLE_POLYGON } from "@/config";
import contracts from "@/contracts/hardhat_contracts.json";
import { useEffect, useState } from "react";
import { addressShortener } from "@/utils/addressShortener";
import { Pool } from "@/types";
const chainId = Number(NETWORK_ID);
const allContracts = contracts as any;
const bettingPoolFactoryAddress =
  allContracts[chainId][0].contracts.BettingPoolFactory.address;
const bettingPoolFactoryABI =
  allContracts[chainId][0].contracts.BettingPoolFactory.abi;
const bettingPoolABI = allContracts[chainId][0].contracts.BettingPool.abi;

const Pool = () => {
  const { data: poolCount, isLoading: poolCountIsLoading } = useContractRead({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "poolCount",
  });
  const {
    data: createdPool,
    writeAsync,
    isSuccess,
    isLoading: createIsLoading,
  } = useContractWrite({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "createDefaultPool",
    args: [USDC_TESTNETMINTABLE_POLYGON],
  });
  return (
    <>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between">
          <h2 className="text-5xl font-bold text-white">Betting pools</h2>
          <button
            className="btn bg-pBlue text-white"
            onClick={async () => {
              await writeAsync();
            }}
            disabled={createIsLoading}
          >
            {createIsLoading ? "creating pool..." : "create pool"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Game</th>
                <th>Address</th>
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
  const { data: poolAddress, isLoading: poolAddressIsLoading } =
    useContractRead({
      addressOrName: bettingPoolFactoryAddress,
      contractInterface: bettingPoolFactoryABI,
      functionName: "pools",
      args: [props.index],
    });
    const { data: signerData } = useSigner();
  const poolContract = useContract({
    addressOrName: poolAddress?.toString() ?? "",
    contractInterface: bettingPoolABI,
    signerOrProvider: signerData || undefined,
  });
  const [pool, setPool] = useState<Pool>()
  useEffect(() => {
    if (signerData) {
      fetchPool()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolContract])

  const fetchPool = async () => {
    const openForBets = await poolContract.openForBets()
    const hasResult = await poolContract.hasResult()
    const totalAmount = await poolContract.totalAmount()
    let status: "open" | "closed" | "yielding";
    if (openForBets) {
      status = "open"
    } else {
      if (hasResult) {
        status = "closed"
      } else {
        status = "yielding"
      }
    }
    setPool({
      address: poolAddress?.toString() ?? "",
      amount: totalAmount,
      status: status,
      coin: "USDC",
      game: "Coin Flip", 
    })
  }
  return (
    <Link href={`/pool/${poolAddress}`}>
      <tr className="hover">
        <th>{pool?.game}</th>
        <td>{addressShortener(pool?.address ?? "")}</td>
        <td>{pool?.status}</td>
        <td>{`${pool?.amount} ${pool?.coin}`}</td>
      </tr>
    </Link>
  );
};

export default Pool;
