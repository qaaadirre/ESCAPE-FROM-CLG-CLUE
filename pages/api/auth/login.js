const { db } = require('../../../lib/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Only POST'})
  const { username, password } = req.body
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username)
  if(!admin) return res.status(401).json({ error: 'invalid' })
  if(!bcrypt.compareSync(password, admin.password_hash)) return res.status(401).json({ error: 'invalid' })
  const token = jwt.sign({ id:admin.id, username:admin.username }, process.env.JWT_SECRET || 'dev_jwt_secret', { expiresIn: '12h' })
  res.json({ token })
}
