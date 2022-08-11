import { Bet } from "./Bet";

export type Pool = {
    address: string;
    game: string;
    status: "open" | "closed" | "yielding";
    amount: number;
    coin: string;
    result?: string;
    owner?: string;
    resultControllerAddress?: string;
    options?: string[];
    bets?: Bet[];
    totalYield?: string;
  };
  