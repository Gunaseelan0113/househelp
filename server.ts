import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("household.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT,
    joining_date TEXT,
    salary REAL,
    payment_day INTEGER
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER,
    month INTEGER,
    year INTEGER,
    amount REAL,
    status TEXT DEFAULT 'unpaid',
    payment_date TEXT,
    FOREIGN KEY (worker_id) REFERENCES workers (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

// Seed Admin User if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run('admin', 'admin123');
}

// Seed Demo Data if empty
const workerCount = db.prepare("SELECT COUNT(*) as count FROM workers").get() as { count: number };
if (workerCount.count === 0) {
  const workers = [
    { name: 'Rani', role: 'cook', phone: '9876543210', address: 'Madurai', joining_date: '2024-01-01', salary: 8000, payment_day: 5 },
    { name: 'Kumar', role: 'cleaning', phone: '9123456780', address: 'Madurai', joining_date: '2024-03-10', salary: 6000, payment_day: 1 },
    { name: 'Murugan', role: 'driver', phone: '9001234567', address: 'Madurai', joining_date: '2023-05-15', salary: 12000, payment_day: 7 },
    { name: 'Lakshmi', role: 'other', phone: '9345678901', address: 'Madurai', joining_date: '2024-02-20', salary: 7000, payment_day: 3 },
    { name: 'Selvam', role: 'gardener', phone: '9789012345', address: 'Madurai', joining_date: '2023-08-12', salary: 5000, payment_day: 10 },
  ];

  const insertWorker = db.prepare(
    "INSERT INTO workers (name, role, phone, address, joining_date, salary, payment_day) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertPayment = db.prepare(
    "INSERT INTO payments (worker_id, month, year, amount, status, payment_date) VALUES (?, ?, ?, ?, ?, ?)"
  );

  workers.forEach(w => {
    const result = insertWorker.run(w.name, w.role, w.phone, w.address, w.joining_date, w.salary, w.payment_day);
    const workerId = result.lastInsertRowid;

    // Add last month's payment (February 2026)
    insertPayment.run(workerId, 2, 2026, w.salary, 'paid', `2026-02-0${w.payment_day}`);
    
    // For Rani and Murugan, mark this month's as paid too (March 2026)
    if (w.name === 'Rani' || w.name === 'Murugan') {
      insertPayment.run(workerId, 3, 2026, w.salary, 'paid', `2026-03-0${w.payment_day}`);
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // API Routes
  app.get("/api/workers", (req, res) => {
    const workers = db.prepare("SELECT * FROM workers").all();
    res.json(workers);
  });

  app.post("/api/workers", (req, res) => {
    const { name, phone, address, role, joining_date, salary, payment_day } = req.body;
    const result = db.prepare(
      "INSERT INTO workers (name, phone, address, role, joining_date, salary, payment_day) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(name, phone, address, role, joining_date, salary, payment_day);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/workers/:id", (req, res) => {
    const { id } = req.params;
    const { name, phone, address, role, joining_date, salary, payment_day } = req.body;
    db.prepare(
      "UPDATE workers SET name = ?, phone = ?, address = ?, role = ?, joining_date = ?, salary = ?, payment_day = ? WHERE id = ?"
    ).run(name, phone, address, role, joining_date, salary, payment_day, id);
    res.json({ success: true });
  });

  app.delete("/api/workers/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM workers WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.get("/api/payments", (req, res) => {
    const payments = db.prepare(`
      SELECT p.*, w.name as worker_name 
      FROM payments p 
      JOIN workers w ON p.worker_id = w.id
    `).all();
    res.json(payments);
  });

  app.get("/api/workers/:id/payments", (req, res) => {
    const { id } = req.params;
    const payments = db.prepare("SELECT * FROM payments WHERE worker_id = ? ORDER BY year DESC, month DESC").all(id);
    res.json(payments);
  });

  app.post("/api/payments", (req, res) => {
    const { worker_id, month, year, amount, status, payment_date } = req.body;
    const result = db.prepare(
      "INSERT INTO payments (worker_id, month, year, amount, status, payment_date) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(worker_id, month, year, amount, status, payment_date);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/payments/:id", (req, res) => {
    const { id } = req.params;
    const { status, payment_date } = req.body;
    db.prepare("UPDATE payments SET status = ?, payment_date = ? WHERE id = ?").run(status, payment_date, id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
