const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "halcyon_it",
  password: "khemnak1530",
  database: "halcyon_it",
});

const transporter = nodemailer.createTransport({
  host: "mail.halcyon.local",
  port: 587,
  secure: false,
  auth: {
    user: "itservice@halcyon.local",
    pass: "Itser@2026",
  },
});

app.post("/api/verifyUser", async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query(
    "SELECT id, username, role, department FROM user WHERE username=? AND password=?",
    [username, password]
  );

  if (rows.length > 0) {
    res.json({ success: true, user: rows[0] });
  } else {
    res.json({ success: false });
  }
});

app.post("/api/ITForm", async (req, res) => {
  try {
    const {
      purpose,
      detail,
      reason,
      spec,
      requester,
      department,
      request_date,
      required_date,
    } = req.body;

    await pool.query(
      `INSERT INTO it_requests
       (purpose, detail, reason, spec, requester, department, request_date, required_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        purpose,
        detail,
        reason,
        spec,
        requester,
        department,
        request_date,
        required_date,
      ]
    );

    const [approvers] = await pool.query(`
      SELECT department, email
      FROM user
      WHERE level >= 2
        AND email IS NOT NULL
    `);

    const departmentMap = {};

    approvers.forEach((user) => {
      if (!departmentMap[user.department]) {
        departmentMap[user.department] = [];
      }
      departmentMap[user.department].push(user.email);
    });

    const pendingUrl = "http://localhost:3000/Pending_Form";

    for (const dept in departmentMap) {
      const emailList = departmentMap[dept].join(",");

      await transporter.sendMail({
        from: '"IT System" <itservice@company.com>',
        to: emailList,
        subject: `มีคำขอ IT ใหม่ (${department})`,
        html: `
          <h3>มีคำขอ IT ใหม่</h3>
          <p><b>ผู้ร้องขอ:</b> ${requester}</p>
          <p><b>แผนกผู้ร้องขอ:</b> ${department}</p>
          <p><b>วัตถุประสงค์:</b> ${purpose}</p>
          <p><b>รายละเอียด:</b> ${detail}</p>
          <p><b>เหตุผล:</b> ${reason}</p>
          <p><b>Spec:</b> ${spec}</p>
          <p><b>วันที่ร้องขอ:</b> ${request_date}</p>
          <hr />
          <p>ส่งถึงผู้อนุมัติแผนก: <b>${dept}</b></p>
          <a href="${pendingUrl}"
             style="
               display:inline-block;
               padding:10px 18px;
               background:#22c55e;
               color:#fff;
               text-decoration:none;
               border-radius:6px;
               font-weight:600;
             ">
            ไปที่หน้า Pending Form
          </a>
        `,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("ITForm Error:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/getITForm", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM it_requests
        ORDER BY created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/getApproveForm", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM it_requests WHERE status ="APPROVED"
       ORDER BY request_date DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/getCompleteForm", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM it_requests WHERE status ="COMPLETE"
       ORDER BY request_date DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/getProblemForm", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM it_requests WHERE status ="PROBLEM"
       ORDER BY request_date DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put("/api/updateStatus/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status, username } = req.body;

    await pool.query(
      `UPDATE it_requests 
       SET status = ?, completed_by = ?, completed_at = NOW()
       WHERE id = ?`,
      [status, username, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/ITApproveForm", async (req, res) => {
  try {
    const { id } = req.body;

    await pool.query(
      `UPDATE it_requests
       SET status = 'APPROVED'
       WHERE id = ?`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/ITFixForm", async (req, res) => {
  try {
    const {
      purpose,
      detail,
      tools,
      requester,
      department,
      request_date,
      required_date,
    } = req.body;

    await pool.query(
      `INSERT INTO it_fixrequest
   (purpose, detail,tools, requester, department, request_date, required_date)
    VALUES (?, ?, ?, ?,?, ?, ?)`,
      [
        purpose,
        detail,
        tools,
        requester,
        department,
        request_date,
        required_date,
      ]
    );

    const [users] = await pool.query(
      `SELECT email
       FROM user
       WHERE level >= 2
         AND email IS NOT NULL`
    );

    const emailList = users.map((u) => u.email).join(",");
    const pendingUrl = "http://localhost:3000/Pending_Form";

    await transporter.sendMail({
      from: `"IT System" <chanasornhockey@gmail.com>`,
      to: emailList,
      subject: " มีคำขอ IT เพื่อรอการอนุมัติ",
      html: `
        <h3>มีคำขอ IT ใหม่</h3>
        <p><b>ผู้ร้องขอ:</b> ${requester}</p>
        <p><b>แผนก:</b> ${department}</p>
        <p><b>วัตถุประสงค์:</b> ${purpose}</p>
        <p><b>เหตุผล:</b> ${detail}</p>
        <p><b>วันที่ร้องขอ:</b> ${request_date}</p>
        <hr />
           <p>
             กรุณาคลิกที่ปุ่มด้านล่างเพื่อพิจารณาอนุมัติ
          </p>

          <a href="${pendingUrl}"
             style="
               display:inline-block;
               padding:10px 18px;
               background:#22c55e;
               color:#fff;
               text-decoration:none;
               border-radius:6px;
               font-weight:600;
             ">
            ไปที่หน้าForm
          </a>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("ITForm Error:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/ITDashboard", async (req, res) => {
  try {
    let { status, startDate, endDate } = req.query;

    if (!["PENDING", "COMPLETE"].includes(status)) status = "PENDING";

    const dateField = status === "COMPLETE" ? "completed_at" : "created_at";

    let sql = `
      SELECT 
        DATE(${dateField}) AS date,
        COUNT(*) AS total
      FROM it_requests
      WHERE status = ?
        AND ${dateField} IS NOT NULL
    `;
    const params = [status];

    if (startDate && endDate) {
      sql += ` AND DATE(${dateField}) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    sql += `
      GROUP BY DATE(${dateField})
      ORDER BY DATE(${dateField})
    `;

    const [rows] = await pool.query(sql, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
app.post("/api/markProblem/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { problem_detail, problem_by } = req.body;

    await pool.query(
      `UPDATE it_requests
       SET 
         status = "PROBLEM",
         problem_detail = ?,
         problem_by = ?,
         problem_at = NOW()
       WHERE id = ?`,
      [problem_detail, problem_by, id]
    );

    res.json({ success: true, message: "Updated to PROBLEM" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

const PORT = 8000;

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
