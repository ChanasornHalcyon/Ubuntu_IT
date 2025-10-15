import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Searchbar from "./components/Searchbar";
import axios from "axios";
import { motion } from "framer-motion";

const NCOT = () => {
  const [dataNCOT, setDataNCOT] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchDataNCOT = async () => {
    try {
      const res = await axios.get(
        "https://halcyonone-internal2-acse.onrender.com/getNCOT"
      );
      if (res.data.success) {
        setDataNCOT(res.data.data);
      } else {
        console.warn("⚠️ ไม่พบข้อมูล NCOT");
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("ยืนยันการลบข้อมูลนี้ใช่หรือไม่?")) return;
    try {
      const res = await axios.delete(
        `https://halcyonone-internal2-acse.onrender.com/delete${id}`
      );
      if (res.data.success) {
        setDataNCOT((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  useEffect(() => {
    fetchDataNCOT();
  }, []);

  return (
    <div className="container mx-auto max-w-[1920px] h-dvh bg-[#F8F8FF] relative">
      <Navbar />
      <Searchbar fetchDataNCOT={fetchDataNCOT} />
      <div className="w-full mt-10 px-5">
        <h2 className="text-2xl font-semibold mb-6 text-[#0B4EA2] text-center">
          Customer: NCOT
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700 border border-gray-900 rounded-xl shadow overflow-hidden">
            <thead className="bg-[#1C70D3] text-white text-left">
              <tr>
                <th className="px-4 py-3 border-r border-gray-900">Id</th>
                <th className="px-4 py-3 border-r border-gray-900">Reason</th>
                <th className="px-4 py-3 border-r border-gray-900">
                  Description
                </th>
                <th className="px-4 py-3 border-r border-gray-900">
                  Customer Part
                </th>
                <th className="px-4 py-3 border-r border-gray-900">DWG No.</th>
                <th className="px-4 py-3 border-r border-gray-900">
                  Customer Name
                </th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#F5F5F5]">
              {dataNCOT.map((item, index) => (
                <tr key={index} className=" border  border-gray-900">
                  <td className="px-4 py-3 text-center border-r border-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-700">
                    {item.reason}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-700">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-700">
                    {item.customer_part}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-700">
                    {item.dwg_no}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-700">
                    {item.customer_name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {item.image_url ? (
                        <button
                          onClick={() => setPreviewImage(item.image_url)}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer"
                        >
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <>
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-start mt-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-xl w-[350px] sm:w-[400px] md:w-[500px] relative">
              <div className="flex justify-between items-center p-4 border-b">
                <h5 className="text-2xl font-semibold text-black">Image</h5>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 flex justify-center items-center">
                <img
                  src={`http://localhost:4000${previewImage}`}
                  alt="Preview"
                  className="max-h-[400px] w-auto object-contain rounded border"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          />
        </>
      )}
    </div>
  );
};

export default NCOT;
