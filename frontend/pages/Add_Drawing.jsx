import React, { useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import { FaFilePdf } from "react-icons/fa6";

const Add_Drawing = () => {
  const [form, setForm] = useState({
    customerName: "",
    date: "",
    drawingNo: "",
    rev: "",
    customerPart: "",
    description: "",
    materialMain: "",
    materialSub: "",
    pcdGrade: "",
    file: "",
  });

  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setForm({ ...form, file: reader.result }); // base64
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";
        setFileType(isImage ? "image" : isPDF ? "pdf" : "other");
        setPreview(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("ไม่พบข้อมูลผู้ใช้ในระบบ กรุณา login ใหม่");
        return;
      }

      const payload = { ...form, employee_drawing: userId };

      const res = await axios.post(
        "https://halcyonone-internal.onrender.com/pushData",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        alert(" Submit Successfully!");
        setForm({
          customerName: "",
          date: "",
          drawingNo: "",
          rev: "",
          customerPart: "",
          description: "",
          materialMain: "",
          materialSub: "",
          pcdGrade: "",
          file: "",
        });
        setPreview(null);
      } else {
        alert(" Submit Failed!");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Server Error!");
    }
  };

  return (
    <div className="container mx-auto max-w-[1920px] min-h-screen bg-[#F8F8FF]">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-7xl mx-auto mt-5 px-8 md:px-52 xl:px-40 rounded-xl"
      >
        {/* --- ฟอร์มช่องกรอกข้อมูล (คงเดิม) --- */}

        <div className="flex items-center justify-center w-full xl:ml-20">
          <div className="flex flex-col items-center justify-center w-full max-w-[500px] h-80 border-2 border-dashed border-gray-400 bg-[#FAFAFA] rounded-md p-6 relative">
            {preview && (
              <div className="mb-4 text-center">
                {fileType === "image" ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-60 h-40 object-contain mx-auto rounded-md"
                  />
                ) : fileType === "pdf" ? (
                  <div className="flex flex-col items-center justify-center text-red-500">
                    <FaFilePdf size={40} />
                    <p className="text-[#1C70D3] text-base font-semibold mt-3">
                      PDF File
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Unsupported file type</p>
                )}
              </div>
            )}

            <input
              type="file"
              name="file"
              onChange={handleChange}
              accept="image/*,application/pdf"
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="px-5 py-2 bg-[#1C70D3] text-white rounded-full cursor-pointer hover:bg-[#0A4EA3] transition"
            >
              Add file
            </label>
          </div>
        </div>

        <div className="flex justify-center xl:mt-4 py-4">
          <button
            type="submit"
            className="px-6 py-2 bg-[#1C70D3] text-white rounded-full hover:bg-[#0A4EA3] transition cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add_Drawing;
