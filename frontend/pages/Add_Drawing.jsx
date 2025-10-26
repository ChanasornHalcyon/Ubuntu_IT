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
    fileBase64: "",
  });

  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";
        setForm((prev) => ({ ...prev, fileBase64: base64 }));
        setFileType(isImage ? "image" : isPDF ? "pdf" : "other");
        setPreview(isImage ? reader.result : isPDF ? file.name : null);
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: form.customerName,
        date: form.date,
        drawingNo: form.drawingNo,
        rev: form.rev,
        customerPart: form.customerPart,
        description: form.description,
        materialMain: form.materialMain,
        materialSub: form.materialSub,
        pcdGrade: form.pcdGrade,
        fileBase64: form.fileBase64,
      };

      const res = await axios.post(
        "https://halcyonone-internal.onrender.com/pushData",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        alert("Submit Successfully!");
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
          fileBase64: "",
        });
        setPreview(null);
      } else {
        alert("Submit Failed!");
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
          <div className="space-y-4 w-full">
            {[
              { label: "Customer Name", name: "customerName", type: "text" },
              { label: "Date", name: "date", type: "date" },
              { label: "Drawing No.", name: "drawingNo", type: "text" },
              { label: "Rev.", name: "rev", type: "text" },
              {
                label: "Customer Part No.",
                name: "customerPart",
                type: "text",
              },
              { label: "Description", name: "description", type: "text" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="block w-full border border-gray-400 rounded-md px-3 py-2 focus:border-[#0B4EA2] text-black"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <select
                  name="materialMain"
                  value={form.materialMain}
                  onChange={handleChange}
                  className="block w-full border border-gray-400 rounded-md px-2 py-2 text-black"
                >
                  <option value="">Drop down</option>
                  <option value="VCMT110302">VCMT110302</option>
                  <option value="DCMT070204">DCMT070204</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Material
                </label>
                <select
                  name="materialSub"
                  value={form.materialSub}
                  onChange={handleChange}
                  className="block w-full border border-gray-400 rounded-md px-2 py-2 text-black"
                >
                  <option value="">Drop down</option>
                  <option value="Steel">Steel</option>
                  <option value="Carbide">Carbide</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PCD Grade
              </label>
              <select
                name="pcdGrade"
                value={form.pcdGrade}
                onChange={handleChange}
                className="block w-full border border-gray-400 rounded-md px-2 py-2 text-black"
              >
                <option value="">Drop down</option>
                <option value="Standard">Standard</option>
                <option value="High Precision">High Precision</option>
              </select>
            </div>
          </div>

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
                        {preview}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Unsupported file type
                    </p>
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
