import Link from "next/link";

const Pool = () => {
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
        <h2 className="text-5xl font-bold text-white">Betting pools</h2>
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
              {bets.map((item, i) => (
                <Link href={`/pool/${i}`} key={i}>
                  <tr className="hover">
                    <th>{item.game}</th>
                    <td>{item.yieldTime}</td>
                    <td>{item.status ? "Open" : "Closed"}</td>
                    <td>{`${item.amount} ${item.coin}`}</td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Pool;
