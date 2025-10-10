import React from "react";
import { useRouter } from "next/router";
import Navbar from "./components/Navbar";

const Homepage = () => {
  const router = useRouter();
  const card = ["NPTR", "NPTA", "NCOT", "MAHLE"];
  const clickCard = (path) => {
    router.push(`/${path}`);
  };

  return (
    <div className="container mx-auto max-w-[1920px] h-dvh bg-[#F8F8FF] relative">
      <Navbar />
      <div className="flex w-full  px-5 mt-5">
        <div className="flex flex-1 justify-center md:mt-10"></div>
      </div>
      <div className=" md:mt-14 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-5 xl:mx-auto ">
          {card.map((item, index) => (
            <div
              key={index}
              onClick={() => clickCard(item)}
              className="h-44 border-3 border-black flex items-center justify-center bg-white text-black font-bold rounded-xl cursor-pointer hover:bg-gray-100 transition"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
