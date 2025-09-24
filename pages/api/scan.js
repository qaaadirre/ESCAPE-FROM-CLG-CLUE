const { db } = require('../../lib/db')

export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).json({ error:'only post' })
  const { qr_code, team_code } = req.body
  const qr = db.prepare('SELECT * FROM qrs WHERE code = ?').get(qr_code)
  if(!qr) return res.status(404).json({ error:'qr not found' })
  // simple team registration / create if not exists
  let team = db.prepare('SELECT * FROM teams WHERE code = ?').get(team_code)
  if(!team){
    db.prepare('INSERT INTO teams (code, name) VALUES (?,?)').run(team_code, team_code)
    team = db.prepare('SELECT * FROM teams WHERE code = ?').get(team_code)
  }
  // check if already scanned same qr by team
  const already = db.prepare('SELECT COUNT(*) as c FROM scans WHERE qr_id = ? AND team_code = ?').get(qr.id, team_code).c
  if(already > 0) return res.json({ message: 'already scanned' })
  db.prepare('INSERT INTO scans (qr_id, team_code, user_agent, ip) VALUES (?,?,?,?)').run(qr.id, team_code, req.headers['user-agent'] || '', req.headers['x-forwarded-for'] || req.socket.remoteAddress)
  res.json({ message: 'scanned' })
}
