import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ModalITForm = ({ onClose, onSubmit, submitting }) => {
    const [file, setFile] = useState(null);
    const [form, setForm] = useState({
        purpose: "",
        detail: "",
        reason: "",
        spec: "",
        requester: "",
        request_date: "",
        department: "",
        required_date: "",
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFile(files[0]);
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitClick = () => {
        const payload = new FormData();
        Object.keys(form).forEach((key) => payload.append(key, form[key]));
        if (file) payload.append("file", file);
        onSubmit(payload);
    };

    useEffect(() => {
        const uname = localStorage.getItem("username") || "";
        const company = localStorage.getItem("company") || "";
        const today = new Date().toISOString().split("T")[0];

        setForm((prev) => ({
            ...prev,
            requester: uname,
            department: company,   
            request_date: today,
        }));
    }, []);

    return (
        <>
            <motion.div
                className="fixed inset-0 z-50 flex justify-center items-start mt-10"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <div className="bg-white w-[380px] sm:w-[520px] md:w-[500px] rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

                    <div className="p-5 border-b sticky top-0 bg-white shadow-sm flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-black">แบบฟอร์มร้องขอ IT</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-red-500 text-2xl cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-6 space-y-6">

                        <div>
                            <label className="font-semibold text-black">วัตถุประสงค์</label>
                            <input
                                type="text"
                                name="purpose"
                                className="w-full mt-1 p-2 border rounded-lg text-black"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-black">รายละเอียดการร้องขอ</label>
                            <input
                                type="text"
                                name="detail"
                                className="w-full mt-1 p-2 border rounded-lg text-black"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-black">เหตุผลหรือความจำเป็น</label>
                            <input
                                type="text"
                                name="reason"
                                className="w-full mt-1 p-2 border rounded-lg text-black"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-black">มาตรฐานหรือ Spec ที่ต้องการ</label>
                            <input
                                type="text"
                                name="spec"
                                className="w-full mt-1 p-2 border rounded-lg text-black"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                            <div>
                                <label className="font-semibold text-black">ชื่อผู้ร้องขอ</label>
                                <input
                                    type="text"
                                    name="requester"
                                    value={form.requester}
                                    readOnly
                                    className="w-full mt-1 p-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>


                            <div>
                                <label className="font-semibold text-black">แผนก / ฝ่าย</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={form.department}
                                    readOnly
                                    className="w-full mt-1 p-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                            <div>
                                <label className="font-semibold text-black">วันที่ร้องขอ</label>
                                <input
                                    type="date"
                                    name="request_date"
                                    value={form.request_date}
                                    readOnly
                                    className="w-full mt-1 p-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-black">วันที่ต้องการ</label>
                                <input
                                    type="date"
                                    name="required_date"
                                    className="w-full mt-1 p-2 border rounded-lg text-black"
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                    </div>

                    <div className="p-5 border-t flex justify-end gap-3 bg-white sticky bottom-0">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer text-black"
                        >
                            ยกเลิก
                        </button>

                        <button
                            onClick={handleSubmitClick}
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer"
                        >
                            {submitting ? "กำลังบันทึก..." : "ส่งฟอร์ม"}
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                animate={{ opacity: 0.4 }}
                onClick={onClose}
            />
        </>
    );
};

export default ModalITForm;
