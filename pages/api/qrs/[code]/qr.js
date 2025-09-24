const { db } = require('../../../../lib/db')
const qrcode = require('qrcode')

export default async function handler(req,res){
  const { code } = req.query
  const qr = db.prepare('SELECT * FROM qrs WHERE code = ?').get(code)
  if(!qr) return res.status(404).send('not found')
  const url = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/qr/' + encodeURIComponent(code)
  try{
    const data = await qrcode.toDataURL(url, { margin:1 })
    const png = Buffer.from(data.split(',')[1], 'base64')
    res.setHeader('Content-Type','image/png')
    res.setHeader('Cache-Control','public, max-age=3600')
    res.end(png)
  }catch(e){
    res.status(500).json({ error: e.message })
  }
}
