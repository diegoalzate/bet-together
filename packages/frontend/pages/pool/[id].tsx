import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { addressShortener } from "@/utils/addressShortener";
import { useContract, useSigner } from "wagmi";
import { NETWORK_ID } from "@/config";
import contracts from "@/contracts/hardhat_contracts.json";
import { Pool, Transaction } from "@/types";

const transactions: Transaction[] = [
  {
    user: "0x000",
    amount: "100",
    bet: "Heads",
    type: "Deposit",
  },
  {
    user: "0x000",
    amount: "100",
    bet: "Heads",
    type: "Withdraw",
  },
];

const chainId = Number(NETWORK_ID);
const allContracts = contracts as any;
const bettingPoolABI = allContracts[chainId][0].contracts.BettingPool.abi;

const PoolDetails = () => {
  const router = useRouter();
  const { id: poolAddress } = router.query;
  const { data: signerData } = useSigner();
  const poolContract = useContract({
    addressOrName: poolAddress?.toString() ?? "",
    contractInterface: bettingPoolABI,
    signerOrProvider: signerData || undefined,
  });
  const [pool, setPool] = useState<Pool>();
  useEffect(() => {
    if (signerData) {
      fetchPool();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolContract]);

  const fetchPool = async () => {
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
      amount: totalAmount,
      status: status,
      coin: "USDC",
      game: "Coin Flip",
    });
  };
  return (
    <>
      <div className="flex flex-col space-y-8">
        <div className="flex space-x-8 items-baseline">
          <h2 className="text-5xl font-bold text-white">
            Pool: #{addressShortener((poolAddress as string) ?? "")}
          </h2>
          <h3 className="text-xl font-semibold text-white">
            Status: {pool?.status}
          </h3>
        </div>
        <div className="bg-sDark flex flex-col items-center h-64 p-4">
          <div className="self-end flex space-x-4">
            <button className="btn  bg-pBlue text-white">Deposit</button>
            <button className="btn  bg-pPurple text-white">Withdraw</button>
          </div>
          <h4 className="text-white">Game: {pool?.game}</h4>
          <div>animation</div>
          <div>outcome</div>
        </div>
        <div className="flex flex-col space-y-4">
          <h2 className="text-3xl font-bold text-white self-center sm:self-start">
            Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Wallet</th>
                  <th>Outcome</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item, i) => (
                  <tr key={i} className="hover">
                    <th>{item.user}</th>
                    <td>{item.bet}</td>
                    <td>{item.amount ? "Open" : "Closed"}</td>
                    <td>{`${item.type}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolDetails;
