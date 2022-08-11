import heroImage from "@/images/hero.png";
import Image, { StaticImageData } from "next/image";
import Link from 'next/link';
export default function Home() {
  return (
    <div className="flex flex-col space-y-20">
      <Hero />
      <Explanation />
      <Team />
    </div>
  );
}

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <Image
          src={heroImage}
          className="max-w-sm rounded-lg shadow-2xl"
          alt="graph"
        />
        <div>
          <h1 className="text-5xl font-bold text-white">
            Say goodbye to <span className="text-red-400">loosing</span> your{" "}
            <span className="text-green-400">money</span> on bets
          </h1>
          <p className="py-6">
            Bet together is a crypto betting protocal that allows you to gamble
            on different on chain and off chain events without losing a dime.
          </p>
          <Link href={'/pool'}>
          <button className="btn bg-pBlue text-white">Get Started</button>

          </Link>
        </div>
      </div>
    </div>
  );
};

const LatestWinners = () => {
  const amountOfCards = 3;
  return (
    <div className="flex flex-col items-center text-white space-y-4">
      <h2 className="text-4xl font-bold">Latest Winners</h2>
      <div className="flex space-x-4">
        {[...Array.from({ length: amountOfCards })].map((v, i) => (
          <Card
            key={i}
            socialName="@jack"
            name={`Ox00${i}`}
            message="I just won 10 Matic!"
          />
        ))}
      </div>
    </div>
  );
};

const Explanation = () => {
  return (
    <div className="flex flex-col items-center text-white space-y-4">
      <h2 className="text-4xl font-bold">How does it work?</h2>
      <ul className="steps">
        <li className="step step-secondary">Bet on a specific outcome</li>
        <li className="step step-secondary">
          Generate yield on amount deposited
        </li>
        <li className="step step-secondary">Check to see if you won the bet</li>
        <li className="step step-secondary">
          Withdraw invested amount plus winnings
        </li>
      </ul>
    </div>
  );
};

const Team = () => {
  const teamItems: CardProps[] = [
    {
      name: "Diego Alzate",
      socialName: "@diegoalzate",
      message: "fullstack dev, dm me for job opportunities lol",
    },
    {
      name: "Bernardo Bianchi Franceschin",
      socialName: "@bfranceschin#1346",
      message: "Just vibin",
    },
    {
      name: "Epi",
      message: "Just vibin",
    },
  ];
  return (
    <div className="flex flex-col items-center text-white space-y-4">
      <h2 className="text-4xl font-bold">Meet our team</h2>
      <div className="flex space-x-4">
        {teamItems.map((item, i) => (
          <Card
            key={i}
            avatar={item.avatar}
            message={item.message}
            name={item.name}
            socialName={item.socialName}
          />
        ))}
      </div>
    </div>
  );
};

type CardProps = {
  avatar?: string | StaticImageData;
  name?: string;
  socialName?: string;
  message?: string;
};

const Card = (props: CardProps) => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl text-white">
      <div className="card-body">
        <div className="flex space-x-4">
          {props.avatar && (
            <div className="avatar">
              <div className="w-24 rounded-full">
                <Image src={props.avatar} alt="avatar" />
              </div>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            {props.name && <h2 className="card-title">{props.name}</h2>}
            {props.socialName && (
              <h3 className="text-sm text-gray-500">{props.socialName}</h3>
            )}
          </div>
        </div>
        {props.message && <p>{props.message}</p>}
      </div>
    </div>
  );
};
