import React, { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "./components/Navbar";
import ModalAddFile from "./components/ModalAddFile";
import { CiSearch } from "react-icons/ci";

const Homepage = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const card = ["NPTR", "NPTA", "NCOT", "MAHLE"];

  const clickOpenModal = () => {
    setOpenModal((prev) => !prev);
  };
  const clickCard = (path) => {
    router.push(`/${path}`);
  };

  return (
    <div className="container mx-auto max-w-[1920px] h-dvh bg-[#F8F8FF] relative">
      <Navbar />
      <div className="flex w-full  px-5 mt-5">
        <div className="flex flex-1 justify-center md:mt-10">
          <div className="flex">
            <input
              className="w-[300px] md:w-96 px-4 py-3 border border-gray-800 rounded-l-md text-gray-600 focus:outline-none"
              placeholder="code or description...."
            />
            <div className="w-16 h-14 flex items-center justify-center bg-[#3698FC]  text-white rounded-r-md border border-l-0 border-gray-800 cursor-pointer">
              <CiSearch className="h-8 w-10" />
            </div>
          </div>
        </div>
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

      {openModal && (
        <ModalAddFile
          onClose={() => setOpenModal(false)}
          onSubmit={() => alert("Submit clicked")}
          submitting={false}
        />
      )}
    </div>
  );
};

export default Homepage;
