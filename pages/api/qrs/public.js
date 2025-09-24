const { db } = require('../../../lib/db')
export default function handler(req,res){
  const qrs = db.prepare('SELECT id, code, title, type, active FROM qrs WHERE active=1 ORDER BY id DESC').all()
  res.json({ qrs })
}
