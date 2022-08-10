export type Pool = {
    address: string;
    game: string;
    status: "open" | "closed" | "yielding";
    amount: number;
    coin: string;
  };
  