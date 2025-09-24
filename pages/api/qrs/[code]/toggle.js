const { db } = require('../../../../lib/db')
const jwt = require('jsonwebtoken')

function auth(req){
  const h = req.headers.authorization || ''
  const m = h.split(' ')
  if(m[0] !== 'Bearer') return null
  try{ return jwt.verify(m[1], process.env.JWT_SECRET || 'dev_jwt_secret') }catch(e){return null}
}

export default function handler(req,res){
  const user = auth(req)
  if(!user) return res.status(401).json({ error:'unauth' })
  const { code } = req.query
  const qr = db.prepare('SELECT * FROM qrs WHERE code = ?').get(code)
  if(!qr) return res.status(404).json({ error:'not found' })
  const newv = qr.active ? 0 : 1
  db.prepare('UPDATE qrs SET active = ? WHERE id = ?').run(newv, qr.id)
  res.json({ message:'toggled', active: newv })
}
