import { useEffect, useState } from "react";
import { useRouter } from 'next/router'

type Bet = {
    game: string;
    yieldTime: string;
    status: boolean;
    amount: number;
    coin: string;
}

type Transaction = {
    user: string,
    bet: string,
    amount: string,
    type: string
}
const transactions: Transaction[] = [
    {
        user: "0x000",
        amount: "100",
        bet: "Heads",
        type: "Deposit"
    },
    {
        user: "0x000",
        amount: "100",
        bet: "Heads",
        type: "Withdraw"
    }
]
const bets: Bet[] = [
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
const PoolDetails = () => {
  const router = useRouter()
  const { id } = router.query
  const [selectedPool, setSelectedPool] = useState<Bet>();
  useEffect(() => {
    setSelectedPool(bets.find((bet, index) => String(index) === id))
  },[id])
  
  return (
    <>
      <div className="flex flex-col space-y-8">
        <div className="flex space-x-8 items-baseline">
            <h2 className="text-5xl font-bold text-white">Pool: #{id}</h2>
            <h3 className="text-xl font-semibold text-white">Status: {selectedPool?.status ? "Open" : "Closed"}</h3>
            <h3 className="text-xl font-semibold text-white">Yield time: {selectedPool?.yieldTime}</h3>
        </div>
        <div className="bg-sDark flex flex-col items-center h-64 p-4">
            <div className="self-end flex space-x-4">
                <button className="btn  bg-pBlue text-white">Deposit</button>
                <button className="btn  bg-pPurple text-white">Withdraw</button>
            </div>
            <h4 className="text-white">Game: {selectedPool?.game}</h4>
            <div>animation</div>
            <div>outcome</div>
        </div>
        <div className="flex flex-col space-y-4">
            <h2 className="text-3xl font-bold text-white self-center sm:self-start">Transactions</h2>
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
