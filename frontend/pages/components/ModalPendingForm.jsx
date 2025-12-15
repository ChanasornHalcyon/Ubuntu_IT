import React from "react";
import { motion } from "framer-motion";

const ModalPendingForm = ({ onClose, data }) => {

    return (
        <>
            <motion.div
                className="fixed inset-0 z-50 flex justify-center items-start mt-16"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <div className="bg-white w-[500px] rounded-2xl shadow-xl">
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-black">รายละเอียดคำขอ IT</h2>
                        <button
                            onClick={onClose}
                            className="text-2xl text-gray-500 hover:text-red-500 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-6 space-y-3 text-sm text-gray-800">
                        <div><b>ผู้ร้องขอ:</b> {data.requester}</div>
                        <div><b>แผนก:</b> {data.department}</div>
                        <div><b>วันที่ร้องขอ:</b> {data.request_date}</div>
                        <div><b>วันที่ต้องการ:</b> {data.required_date}</div>
                        <div><b>วัตถุประสงค์:</b> {data.purpose}</div>
                        <div><b>รายละเอียด:</b> {data.detail}</div>
                        <div><b>เหตุผล:</b> {data.reason}</div>
                        <div><b>Spec:</b> {data.spec}</div>
                    </div>

                    <div className="p-5 border-t flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="
                                px-4 py-2 rounded-lg text-gray-700 bg-gray-100
                                hover:bg-gray-200 hover:text-gray-900
                                transition-all duration-150
                                shadow-sm cursor-pointer
                                active:scale-95
    "
                        >
                            ปิด
                        </button>

                        <button
                            onClick={() => {

                                onClose();
                            }}
                            className="
                                    px-5 py-2 rounded-lg text-white font-medium
                                    bg-gradient-to-r from-green-500 to-green-600
                                    hover:from-green-600 hover:to-green-700
                                    shadow-md hover:shadow-lg
                                    transition-all duration-150
                                    active:scale-95 cursor-pointer
    "
                        >
                            Approve
                        </button>
                    </div>


                </div>
            </motion.div>

            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onClose}
            />
        </>
    );
};

export default ModalPendingForm;
