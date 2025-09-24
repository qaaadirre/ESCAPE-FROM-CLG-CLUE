const { db } = require('../../../lib/db')
const jwt = require('jsonwebtoken')

function auth(req){
  const h = req.headers.authorization || ''
  const m = h.split(' ')
  if(m[0] !== 'Bearer') return null
  try{
    return jwt.verify(m[1], process.env.JWT_SECRET || 'dev_jwt_secret')
  }catch(e){ return null }
}

export default function handler(req, res){
  if(req.method === 'GET'){
    // admin-protected list
    const user = auth(req)
    if(!user) return res.status(401).json({ error:'unauth' })
    const qrs = db.prepare('SELECT * FROM qrs ORDER BY id DESC').all()
    res.json({ qrs })
  } else if(req.method === 'POST'){
    const user = auth(req)
    if(!user) return res.status(401).json({ error:'unauth' })
    const { code, title, type, clues_json, rotate_seconds } = req.body
    try{
      db.prepare('INSERT INTO qrs (code,title,type,clues_json,rotate_seconds) VALUES (?,?,?,?,?)').run(code, title, type || 'basic', clues_json || '[]', rotate_seconds || 15)
      res.json({ message: 'created' })
    }catch(e){
      res.status(500).json({ error: e.message })
    }
  } else {
    res.status(405).json({ error: 'method' })
  }
}
