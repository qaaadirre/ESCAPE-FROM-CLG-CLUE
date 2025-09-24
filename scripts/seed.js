
const { db } = require('../lib/db');
const bcrypt = require('bcryptjs');

const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!admin) {
  const hash = bcrypt.hashSync('password123', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('Seeded admin/admin (password: password123)');
} else {
  console.log('Admin exists');
}

const qCount = db.prepare('SELECT COUNT(*) as c FROM qrs').get().c;
if (qCount === 0) {
  const sampleClues = JSON.stringify([
    { text: "Find the blue mural near the library", media: null },
    { text: "Look under the wooden bench by the fountain", media: null },
    { text: "Search the noticeboard with a red poster", media: null }
  ]);
  db.prepare('INSERT INTO qrs (code,title,clues_json,type) VALUES (?,?,?,?)').run('QR001','North Quad Clue', sampleClues, 'basic');
  db.prepare('INSERT INTO qrs (code,title,clues_json,type) VALUES (?,?,?,?)').run('QR002','Library Clue', sampleClues, 'basic');
  console.log('Seeded sample QRs');
}
