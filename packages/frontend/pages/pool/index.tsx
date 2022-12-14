/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import {
  useContract,
  useContractRead,
  useContractWrite,
  useSigner,
  useWaitForTransaction,
} from "wagmi";
import {
  FAKE_ADDRESS,
  NETWORK_ID,
  USDC_TESTNETMINTABLE_GOERLI,
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

const aaveVrfbettingPoolFactoryAddress =
  allContracts[chainId][0].contracts.aaveVrfBettingPoolFactory.address;
const aaveVrfbettingPoolFactoryABI =
  allContracts[chainId][0].contracts.aaveVrfBettingPoolFactory.abi;

const aaveFakeWorldCupBettingPoolFactoryAddress =
  allContracts[chainId][0].contracts.aaveFakeWorldCupBettingPoolFactory.address;
const aaveFakeWorldCupBettingPoolFactoryABI =
  allContracts[chainId][0].contracts.aaveFakeWorldCupBettingPoolFactory.abi;

const bettingPoolABI = allContracts[chainId][0].contracts.BettingPool.abi;
// TODO: get decimals from token
const decimals = 6;

const BETTING_GAMES = {
  COIN_FLIP: "createCoinFlipPool",
  WORLD_CUP: "createWorldCupPool",
};

const Pool = () => {
  const [poolTransaction, setPoolTransaction] = useState("");
  const { isLoading: poolTransactionIsLoading, isSuccess } =
    useWaitForTransaction({
      hash: poolTransaction ?? FAKE_ADDRESS,
    });
  const { data: signerData } = useSigner();
  const {
    data: poolCount,
    isLoading: poolCountIsLoading,
    refetch,
  } = useContractRead({
    addressOrName: bettingPoolFactoryAddress,
    contractInterface: bettingPoolFactoryABI,
    functionName: "poolCount",
  });
  const bettingPoolContract = useContract({
    addressOrName: aaveVrfbettingPoolFactoryAddress,
    contractInterface: aaveVrfbettingPoolFactoryABI,
    signerOrProvider: signerData || undefined,
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
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn bg-pBlue text-white m-1">
              {poolTransactionIsLoading ? "creating pool..." : "create pool"}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <button
                  onClick={async () => {
                    try {
                      const tx = await bettingPoolContract?.[
                        BETTING_GAMES.COIN_FLIP
                      ](USDC_TESTNETMINTABLE_GOERLI);
                      setPoolTransaction(tx.hash);
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                  disabled={poolTransactionIsLoading}
                >
                  Coin Flip
                </button>
              </li>
              <li>
                <button
                  onClick={async () => {
                    try {
                      const tx = await bettingPoolContract?.[
                        BETTING_GAMES.WORLD_CUP
                      ](USDC_TESTNETMINTABLE_GOERLI);
                      setPoolTransaction(tx.hash);
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                  disabled={poolTransactionIsLoading}
                >
                  World Cup
                </button>
              </li>
            </ul>
          </div>
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
        const gameEncoded = await poolContract.getGame();
        const game = ethers.utils.parseBytes32String(gameEncoded);
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
          amount: Number(ethers.utils.formatUnits(totalAmount, decimals)),
          status: status,
          coin: "USDC",
          game: game,
        });
      }
    } catch (e) {
      console.log(e);
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
