const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(process.cwd(), 'data', 'db.sqlite');

if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// initialize schema
db.exec(`PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT
);

CREATE TABLE IF NOT EXISTS qrs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE,
  title TEXT,
  active INTEGER DEFAULT 1,
  type TEXT DEFAULT 'basic',
  clues_json TEXT DEFAULT '[]',
  rotate_seconds INTEGER DEFAULT 15,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id INTEGER,
  team_code TEXT,
  timestamp DATETIME DEFAULT (datetime('now')),
  user_agent TEXT,
  ip TEXT,
  extra_json TEXT,
  FOREIGN KEY(qr_id) REFERENCES qrs(id)
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE,
  name TEXT,
  members_json TEXT DEFAULT '[]',
  skips INTEGER DEFAULT 2,
  premium INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  k TEXT PRIMARY KEY,
  v TEXT
);
`);

// helper
module.exports = {
  db
};
