import Image from "next/image";
import logo from '../../public/logo-solcalimr.png';
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";

export default function Home() {
  return (
    <div className="flex flex-col items-center">

      <Image src={logo} alt="SOLClaimr" />
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold my-10">Building...</h1>
        <Link className="flex gap-2 hover:underline" href="https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fsolclaimr.xyz%2Fapi%2Faction&cluster=mainnet" target="_blank">Access our Blink <ArrowTopRightOnSquareIcon color="black" width={14} />  </Link>
      </main>
    </div>
  );
}
