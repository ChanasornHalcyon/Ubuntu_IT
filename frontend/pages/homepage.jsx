import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import ModalITForm from "./components/ModalITForm";

const Homepage = () => {
  const [role, setRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      console.log("FORM DATA:", [...payload]);

    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
    setShowModal(false);
  };

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

      <div className="py-40 md:py-32 flex justify-center">
        <motion.div
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          onClick={() => setShowModal(true)}
          className={cardClass}
        >
          <span className="text-lg font-semibold text-[#0B4EA2] tracking-wide">
            IT Form
          </span>
        </motion.div>
      </div>

      {showModal && (
        <ModalITForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default Homepage;
