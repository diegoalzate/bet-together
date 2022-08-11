import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { addressShortener } from "@/utils/addressShortener";
import { useContract, useSigner } from "wagmi";
import { FAKE_ADDRESS, NETWORK_ID } from "@/config";
import contracts from "@/contracts/hardhat_contracts.json";
import { Pool, Transaction } from "@/types";
import { ethers } from "ethers";
import Link from "next/link";

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
const myTokenAddress = allContracts[chainId][0].contracts.MyToken.address
const myTokenABI = allContracts[chainId][0].contracts.MyToken.abi

const PoolDetails = () => {
  const router = useRouter();
  const { id: poolAddress } = router.query;
  const { data: signerData } = useSigner();
  const poolContract = useContract({
    addressOrName: poolAddress?.toString() ?? FAKE_ADDRESS,
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
    const optionCount = Number(
      (await poolContract.getOptionsCount()).toString()
    );
    let optionNames = [];
    for (let index = 0; index < optionCount; index++) {
      const optionEncoded = await poolContract.getOptionName(index);
      const optionDecoded = ethers.utils.parseBytes32String(optionEncoded);
      optionNames.push(optionDecoded);
    }
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
    // get result name
    let result;
    if (hasResult) {
      const optionIndex = await poolContract.getResult();
      const optionName = await poolContract.optionName(optionIndex);
      const resultName = ethers.utils.parseBytes32String(optionName);
      result = resultName;
    }
    setPool({
      address: poolAddress?.toString() ?? "",
      amount: totalAmount,
      status: status,
      coin: "USDC",
      game: "Coin Flip",
      result: result,
      options: optionNames,
    });
  };
  return (
    <>
      <div className="flex flex-col space-y-8">
        <div className="flex space-x-8 items-baseline">
          <Link href={`https://mumbai.polygonscan.com/address/${poolAddress}`}>
            <h2 className="text-5xl font-bold text-white cursor-pointer">
              Pool: #{addressShortener((poolAddress as string) ?? "")}
            </h2>
          </Link>
          <h3 className="text-xl font-semibold text-white">
            Status: {pool?.status}
          </h3>
        </div>
        <div className="bg-sDark flex flex-col items-center h-64 p-4">
          <div className="self-end flex space-x-4">
            <BetModalButton pool={pool} />
            <button className="btn  bg-pPurple text-white">Withdraw</button>
          </div>
          <h4 className="text-white">Game: {pool?.game}</h4>
          <div>animation</div>
          <div>outcome: {pool?.result ?? "no result yet"}</div>
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

const BetModalButton = (props: { pool?: Pool }) => {
  const [form, setForm ] = useState({
    option: "",
    amount: 0
  })
  const { data: signerData } = useSigner();
  const [allowance, setAllowance] = useState<String>()
  const poolContract = useContract({
    addressOrName: props.pool?.address?.toString() ?? FAKE_ADDRESS,
    contractInterface: bettingPoolABI,
    signerOrProvider: signerData || undefined,
  });
  const tokenContract = useContract({
    addressOrName: myTokenAddress.toString() ?? FAKE_ADDRESS,
    contractInterface: myTokenABI,
    signerOrProvider: signerData || undefined,
  });

  useEffect(() => {
    if (signerData && tokenContract) {
      fetchAllowance()
    }
  } ,[signerData, tokenContract, props])
  // bring options
  // amount
  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> ) => {
    const {value, name} = e.target
    setForm((prev) => ({...prev, [name]: value}))
  }

  const fetchAllowance = async () => {
    console.log("fetching")
    const userAddress = await signerData?.getAddress()
    if (userAddress && tokenContract &&  props.pool?.address) {
      const allowance = await tokenContract?.allowance(userAddress, props.pool?.address)
      console.log(allowance.toString())

      setAllowance(allowance.toString())
    }
  }

  const sendBet = async () => {
    const optionIndex = props.pool?.options?.findIndex(value => value === form.option)
    console.log(allowance, props.pool?.address, ethers.constants.MaxUint256.toString())
    if (allowance && allowance === "0") {
      const allowanceTxn = await tokenContract.approve(props.pool?.address, ethers.constants.MaxUint256.toString())
      await allowanceTxn.wait()
      await poolContract.bet(optionIndex?.toString(), form.amount.toString())
    } else {
      await poolContract.bet(optionIndex?.toString(), form.amount.toString())
    }
  }

  return (
    <>
      <label htmlFor="my-modal-3" className="btn bg-pBlue text-white">
        Bet
      </label>

      <input type="checkbox" id="my-modal-3" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label
            htmlFor="my-modal-3"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>
          <h3 className="text-lg font-bold text-white my-2">
            Set bet
          </h3>
          <div className="flex flex-col space-y-4">
            <input name="amount" type={"number"} className="input bg-pPurple text-white" onChange={handleChange} value={form.amount}/>
            <select value={form.option} onChange={handleChange} className="select bg-pPurple text-white" name="option">
              {props.pool?.options?.map((value, index) => (
                <option key={index}>{value}</option>
              ))}
            </select>
          </div>
          <button onClick={sendBet} className="btn  bg-pBlue text-white w-full my-4">bet</button>
        </div>
      </div>
    </>
  );
};

export default PoolDetails;
