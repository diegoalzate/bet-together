/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import {
  useContract,
  useContractRead,
  useContractWrite,
  useFeeData,
  useSigner,
  useWaitForTransaction,
} from "wagmi";
import {
  FAKE_ADDRESS,
  NETWORK_ID,
  USDC_TESTNETMINTABLE_POLYGON,
} from "@/config";
import contracts from "@/contracts/hardhat_contracts.json";
import { useEffect, useState } from "react";
import { addressShortener } from "@/utils/addressShortener";
import { Pool } from "@/types";
import { ethers } from "ethers";
const chainId = Number(NETWORK_ID);
const allContracts = contracts as any;
const bettingPoolFactoryAddress =
  allContracts[chainId][0].contracts.BettingPoolFactory.address;
const bettingPoolFactoryABI =
  allContracts[chainId][0].contracts.BettingPoolFactory.abi;
const bettingPoolABI = allContracts[chainId][0].contracts.BettingPool.abi;
const myTokenAddress = allContracts[chainId][0].contracts.MyToken.address;

const Pool = () => {
  const [poolTransaction, setPoolTransaction] = useState("");
  const { isLoading: poolTransactionIsLoading, isSuccess } =
    useWaitForTransaction({
      hash: poolTransaction ?? FAKE_ADDRESS,
    });
  const {
    data: poolCount,
    isLoading: poolCountIsLoading,
    refetch,
  } = useContractRead({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "poolCount",
  });
  const { writeAsync, isLoading: createIsLoading } = useContractWrite({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "createDefaultPool",
    args: [myTokenAddress],
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess]);

  return (
    <>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between">
          <h2 className="text-5xl font-bold text-white">Betting pools</h2>
          <button
            className="btn bg-pBlue text-white"
            onClick={async () => {
              try {
                const tx = await writeAsync();
                setPoolTransaction(tx.hash);
              } catch (e) {
                console.log(e);
              }
            }}
            disabled={createIsLoading || poolTransactionIsLoading}
          >
            {createIsLoading || poolTransactionIsLoading
              ? "creating pool..."
              : "create pool"}
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
              {[...Array.from({ length: +(poolCount?.toString() ?? 0) })]
                .map((item, i) => <PoolRow key={i} index={i} />)
                .reverse()}
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
    addressOrName: poolAddress?.toString() ?? FAKE_ADDRESS,
    contractInterface: bettingPoolABI,
    signerOrProvider: signerData || undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pool, setPool] = useState<Pool>();

  useEffect(() => {
    if (
      signerData &&
      !!poolContract.address &&
      poolContract.address !== FAKE_ADDRESS &&
      poolAddress?.toString() &&
      !poolAddressIsLoading
    ) {
      console.log(poolContract)
      fetchPool();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolContract]);

  const fetchPool = async () => {
    setIsLoading(true);
    try {
      if (await poolContract.deployed()) {
        const openForBets = await poolContract.openForBets();
        const hasResult = await poolContract.hasResult();
        const totalAmount = await poolContract.totalAmount();
        let status: "open" | "closed" | "yielding";
        if (openForBets) {
          status = "open";
        } else {
          if (hasResult) {
            status = "closed";
          } else {
            status = "yielding";
          }
        }
        setPool({
          address: poolAddress?.toString() ?? "",
          amount: Number(ethers.utils.formatUnits(totalAmount, 18)),
          status: status,
          coin: "MTK",
          game: "Coin Flip",
        });
      }
    } catch (e) {
      console.log(e)
    }
    setIsLoading(false);
  };
  return (
    <Link href={`/pool/${poolAddress}`}>
      <tr className={`hover ${isLoading && "animate-pulse"}`}>
        {isLoading ? (
          <>
            <th>loading...</th>
            <td></td>
            <td></td>
            <td></td>
          </>
        ) : (
          <>
            <th>{pool?.game}</th>
            <td>{addressShortener(pool?.address ?? "")}</td>
            <td>{pool?.status}</td>
            <td>{`${pool?.amount} ${pool?.coin}`}</td>
          </>
        )}
      </tr>
    </Link>
  );
};

export default Pool;
