const { db } = require('../../../lib/db')
const qrcode = require('qrcode')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

export default async function handler(req,res){
  const { code } = req.query
  const method = req.method
  if(method === 'GET'){
    // public view of a single qr
    const qr = db.prepare('SELECT * FROM qrs WHERE code = ?').get(code)
    if(!qr) return res.status(404).json({ error:'not found' })
    return res.json({ qr })
  }
  res.status(405).end()
}
