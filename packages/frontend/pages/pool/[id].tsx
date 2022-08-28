import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { addressShortener } from "@/utils/addressShortener";
import { useContract, useSigner } from "wagmi";
import {
  FAKE_ADDRESS,
  NETWORK_ID,
  USDC_TESTNETMINTABLE_GOERLI,
  USDC_TESTNETMINTABLE_GOERLI_URL,
} from "@/config";
import contracts from "@/contracts/hardhat_contracts.json";
import { Pool, Bet } from "@/types";
import { ethers } from "ethers";
import Link from "next/link";
import { Skeleton } from "@/components";

const chainId = Number(NETWORK_ID);
const allContracts = contracts as any;
const bettingPoolABI = allContracts[chainId][0].contracts.BettingPool.abi;
const myTokenAddress = allContracts[chainId][0].contracts.MyToken.address;
const myTokenABI = allContracts[chainId][0].contracts.MyToken.abi;
const resultControllerAddress =
  allContracts[chainId][0].contracts.notQuiteRandomCoinFlip.address;
const resultControllerABI =
  allContracts[chainId][0].contracts.notQuiteRandomCoinFlip.abi;
// TODO: get decimals from token
const decimals = 6;

const PoolDetails = () => {
  const [pool, setPool] = useState<Pool>();
  const router = useRouter();
  const { id: poolAddress } = router.query;
  const { data: signerData } = useSigner();
  const [signerAddress, setSignerAddress] = useState("");
  const [userOutcome, setUserOutcome] = useState(false);
  const [userProfit, setUserProfit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const poolContract = useContract({
    addressOrName: poolAddress?.toString() ?? FAKE_ADDRESS,
    contractInterface: bettingPoolABI,
    signerOrProvider: signerData || undefined,
  });
  const resultControllerContract = useContract({
    addressOrName: pool?.resultControllerAddress?.toString() ?? FAKE_ADDRESS,
    contractInterface: resultControllerABI,
    signerOrProvider: signerData || undefined,
  });
  useEffect(() => {
    if (signerData && poolContract) {
      fetchPool();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolContract]);

  const fetchPool = async () => {
    setIsLoading(true);
    try {
      const openForBets = await poolContract.openForBets();
      const hasResult = await poolContract.hasResult();
      const totalAmount = await poolContract.totalAmount();
      const ownerAddress = await poolContract.owner();
      const resultControllerAddress = await poolContract?.resultController();
      const betPlacedFilter = await poolContract.filters.betPlaced();
      const totalYield = await poolContract.getTotalYield();
      const betEvents = await poolContract.queryFilter(betPlacedFilter);
      const signerAddress = await signerData?.getAddress();
      const optionCount = Number(
        (await poolContract.getOptionsCount()).toString()
      );
      let optionNames: string[] = [];
      for (let index = 0; index < optionCount; index++) {
        const optionEncoded = await poolContract.getOptionName(index);
        const optionDecoded = ethers.utils.parseBytes32String(optionEncoded);
        optionNames.push(optionDecoded);
      }
      const gameEncoded = await poolContract.getGame();
      const game = ethers.utils.parseBytes32String(gameEncoded);
      const bets = betEvents.map((event: any) => ({
        sender: event.args.user,
        optionName: optionNames[Number(event.args.option.toString())],
        amount: event.args.amount.toString(),
      }));
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
      let userResult;
      let userProfit;
      if (hasResult) {
        const optionIndex = await poolContract.getResult();
        userResult = await poolContract.bets(signerAddress, optionIndex);
        userProfit = await poolContract.getUserProfit(signerAddress);
        const optionName = await poolContract.getOptionName(optionIndex);
        const resultName = ethers.utils.parseBytes32String(optionName);
        result = resultName;
      }
      setSignerAddress(signerAddress as string);
      setPool({
        address: poolAddress?.toString() ?? "",
        amount: totalAmount,
        status: status,
        coin: "USDC",
        game: game,
        result: result,
        options: optionNames,
        resultControllerAddress: resultControllerAddress,
        owner: ownerAddress,
        bets: bets,
        totalYield: ethers.utils.formatUnits(totalYield.toString(), decimals),
      });
      setUserOutcome(userResult && userResult.gt(0));
      setUserProfit(
        userProfit
          ? ethers.utils.formatUnits(userProfit.toString(), decimals)
          : ""
      );
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const closePool = async () => {
    const closeTx = await poolContract.lockPool();
    await closeTx.wait();
    await fetchPool();
  };

  const generateResult = async () => {
    const generateTx = await resultControllerContract.generateResult();
    await generateTx.wait();
    await fetchPool();
  };

  const withdraw = async () => {
    const withdrawTx = await poolContract.withdraw();
    await withdrawTx.wait();
  };

  const ownerButton = () => {
    let btn;
    if (pool?.status === "open") {
      btn = (
        <button className="btn  bg-pPurple text-white" onClick={closePool}>
          close pool
        </button>
      );
    } else if (pool?.status === "yielding" && pool?.resultControllerAddress) {
      btn = (
        <button className="btn  bg-pPurple text-white" onClick={generateResult}>
          generate result
        </button>
      );
    }
    return btn;
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
          {!isLoading ? (
            <h3 className="text-xl font-semibold text-white">
              Status: {pool?.status}
            </h3>
          ) : (
            <Skeleton className="w-24 h-4" />
          )}
          {!!pool?.result && (
            <h3 className="text-xl font-semibold text-white">
              yielded: {pool?.totalYield}
            </h3>
          )}
        </div>
        <div className="bg-sDark flex flex-col items-center h-64 p-4">
          <div className="self-end flex space-x-4">
            {signerAddress === pool?.owner ? ownerButton() : ""}
            {pool?.status === "open" && (
              <>
                <BetModalButton pool={pool} callback={fetchPool} />
                <button
                  className="btn bg-pPurple text-white"
                  onClick={() => {
                    window.open(USDC_TESTNETMINTABLE_GOERLI_URL);
                  }}
                >
                  USDC FAUCET
                </button>
              </>
            )}
            {pool?.status === "closed" && (
              <button className="btn bg-pPurple text-white" onClick={withdraw}>
                Withdraw
              </button>
            )}
          </div>
          {!isLoading ? (
            <h4 className="text-white">Game: {pool?.game}</h4>
          ) : (
            <Skeleton className="w-24 h-4" />
          )}
          <div>
            {!isLoading ? (
              pool?.result ? (
                userOutcome ? (
                  `You won ${userProfit}`
                ) : (
                  "You lost"
                )
              ) : (
                "Pool still has not generated a result"
              )
            ) : (
              <Skeleton className="w-28 mt-3 h-4" />
            )}
          </div>
          {!isLoading ? (
            <div>outcome: {pool?.result ?? "no result yet"}</div>
          ) : (
            <Skeleton className="w-28 mt-3 h-4" />
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <h2 className="text-3xl font-bold text-white self-center sm:self-start">
            Bets
          </h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Wallet</th>
                  <th>Outcome</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {pool?.bets?.map((item, i) => (
                  <tr key={i} className="hover">
                    <th>{addressShortener(item.sender)}</th>
                    <td>{item.optionName}</td>
                    <td>{ethers.utils.formatUnits(item.amount, decimals)}</td>
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

const BetModalButton = (props: { pool?: Pool; callback?: () => void }) => {
  const [form, setForm] = useState({
    option: props.pool?.options?.[0],
    amount: 0,
  });
  const { data: signerData } = useSigner();
  const [allowance, setAllowance] = useState<String>();
  const poolContract = useContract({
    addressOrName: props.pool?.address?.toString() ?? FAKE_ADDRESS,
    contractInterface: bettingPoolABI,
    signerOrProvider: signerData || undefined,
  });
  const tokenContract = useContract({
    //addressOrName: myTokenAddress.toString() ?? FAKE_ADDRESS,
    addressOrName: USDC_TESTNETMINTABLE_GOERLI,
    contractInterface: myTokenABI,
    signerOrProvider: signerData || undefined,
  });

  useEffect(() => {
    if (signerData && tokenContract) {
      fetchAllowance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerData, tokenContract, props]);
  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { value, name } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchAllowance = async () => {
    const userAddress = await signerData?.getAddress();
    if (userAddress && tokenContract && props.pool?.address) {
      const allowance = await tokenContract?.allowance(
        userAddress,
        props.pool?.address
      );
      setAllowance(allowance.toString());
    }
  };

  const sendBet = async () => {
    const optionIndex = props.pool?.options?.findIndex(
      (value) => value === form.option
    );
    console.log(
      allowance,
      props.pool?.address,
      ethers.constants.MaxUint256.toString()
    );
    if (allowance && allowance === "0") {
      const allowanceTxn = await tokenContract.approve(
        props.pool?.address,
        ethers.constants.MaxUint256.toString()
      );
      await allowanceTxn.wait();
      const betTxn = await poolContract.bet(
        optionIndex?.toString(),
        ethers.utils.parseUnits(form.amount.toString(), decimals)
      );
      await betTxn.wait();
      if (props.callback) {
        await props.callback();
      }
    } else {
      const betTxn = await poolContract.bet(
        optionIndex?.toString(),
        ethers.utils.parseUnits(form.amount.toString())
      );
      await betTxn.wait();
      if (props.callback) {
        await props.callback();
      }
    }
  };

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
          <h3 className="text-lg font-bold text-white my-2">Set bet</h3>
          <div className="flex flex-col space-y-4">
            <input
              name="amount"
              type={"number"}
              className="input bg-pPurple text-white"
              onChange={handleChange}
              value={form.amount}
            />
            <select
              value={form.option}
              onChange={handleChange}
              className="select bg-pPurple text-white"
              name="option"
            >
              {props.pool?.options?.map((value, index) => (
                <option key={index}>{value}</option>
              ))}
            </select>
          </div>
          <button
            onClick={sendBet}
            className="btn  bg-pBlue text-white w-full my-4"
          >
            bet
          </button>
        </div>
      </div>
    </>
  );
};

export default PoolDetails;
