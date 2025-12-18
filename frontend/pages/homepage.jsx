import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import ModalITForm from "./components/ModalITForm";
import ModalFixForm from "./components/ModalFixForm";
import { useRouter } from "next/router";
const Homepage = () => {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [showModalForm, setshowModalForm] = useState(false);
  const [showModalFixForm, setshowModalFixForm] = useState(false);
  const openPending = () => {
    router.push("./Pending_Form")
  }
  const openApprove = () => {
    router.push("./Approve_Form")
  }
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole || "");
  }, []);

  const cardClass =
    "h-48 w-72 flex flex-col items-center justify-center \
     bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] \
     border transition-all duration-150 cursor-pointer \
     border-gray-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] \
     hover:border-[#1C70D3] hover:bg-gradient-to-br hover:from-white hover:to-blue-50";

  return (
    <div className="container mx-auto max-w-[1920px] h-dvh bg-[#F8F8FF] relative">
      <Navbar />
      <div className="pt-40 md:pt-32 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            onClick={() => setshowModalForm(true)}
            className={cardClass}
          >
            <span className="text-lg font-semibold text-[#0B4EA2] tracking-wide">
              IT_Form
            </span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={cardClass}
            onClick={() => setshowModalFixForm(true)}
          >
            <span className="text-lg font-semibold text-[#0B4EA2] tracking-wide">
              Fix_Form
            </span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={cardClass}
            onClick={openPending}
          >
            <span className="text-lg font-semibold text-[#0B4EA2] tracking-wide">
              Pending_Form
            </span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={cardClass}
            onClick={openApprove}
          >
            <span className="text-lg font-semibold text-[#0B4EA2] tracking-wide">
              Approve_Form
            </span>
          </motion.div>

        </div>
      </div>


      {showModalForm && <ModalITForm onClose={() => setshowModalForm(false)} />}
      {showModalFixForm && <ModalFixForm onClose={() => setshowModalFixForm(false)} />}
    </div>
  );
};

export default Homepage;
