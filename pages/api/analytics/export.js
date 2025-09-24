const { db } = require('../../../lib/db')
const stringify = require('csv-stringify').stringify

export default function handler(req,res){
  const fmt = req.query.format || 'csv'
  const rows = db.prepare(`SELECT scans.id, qrs.code as qr_code, qrs.title as qr_title, scans.team_code, scans.timestamp FROM scans LEFT JOIN qrs ON scans.qr_id=qrs.id ORDER BY scans.id DESC`).all()
  if(fmt === 'json'){
    return res.json({ rows })
  }
  // csv
  const header = ['id','qr_code','qr_title','team_code','timestamp']
  stringify([header, ...rows.map(r=>[r.id,r.qr_code,r.qr_title,r.team_code,r.timestamp])], (err, out)=>{
    if(err) return res.status(500).send(err.message)
    res.setHeader('Content-Type','text/csv')
    res.setHeader('Content-Disposition','attachment; filename="scans.csv"')
    res.send(out)
  })
}
