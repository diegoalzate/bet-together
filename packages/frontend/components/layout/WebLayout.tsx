import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

type WebLayoutProps = {
  children: React.ReactNode;
};

export const WebLayout = ({ children }: WebLayoutProps) => {
  return (
    <div className="bg-pDark h-screen flex flex-col overflow-y-hidden">
      <Header />
      <main className="flex-grow overflow-y-auto font-poppins py-4 px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const Header = () => {
  return (
    <header className="flex justify-between h-28 py-4 px-8 sticky top-0 bg-pDark z-30 text-white font-work-sans">
      <Link href={"/"}>
        <div className="font-bold text-2xl cursor-pointer">Bet together</div>
      </Link>
      <div className="sm:px-6">
        <ConnectButton />
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="footer items-center p-4 bg-sDark text-neutral-content">
      <div className="items-center grid-flow-col space-x-6">
        <p>Copyright © 2022</p>
        <Link href={"https://github.com/diegoalzate/bet-together"}>
          <a target={"_blank"}>Github</a>
        </Link>
      </div>
    </footer>
  );
};
