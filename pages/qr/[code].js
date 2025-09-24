import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function QRDirect() {
  const router = useRouter()
  const { code } = router.query
  const [qr, setQr] = useState(null)
  const [teamCode, setTeamCode] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [clues, setClues] = useState([])

  useEffect(()=>{
    if(!code) return
    fetch('/api/qrs/'+code).then(r=>r.json()).then(data=>{
      setQr(data.qr)
      setClues(JSON.parse(data.qr.clues_json || '[]'))
      setCurrentIndex(0)
    })
  },[code])

  useEffect(()=>{
    if(!qr) return
    const sec = qr.rotate_seconds || 15
    const t = setInterval(()=> {
      setCurrentIndex(i=> (i+1)%clues.length)
    }, sec*1000)
    return ()=> clearInterval(t)
  },[qr, clues.length])

  const submitTeam = async () => {
    // register scan
    const res = await fetch('/api/scan', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ qr_code: code, team_code: teamCode })
    })
    const result = await res.json()
    alert(result.message || 'scanned')
  }

  if(!qr) return <div className="container p-6">Loading...</div>

  return (
    <div className="container p-6">
      <h2 className="text-2xl font-bold">{qr.title} ({qr.code})</h2>
      <div className="mt-4 bg-white p-4 rounded shadow">
        <div className="min-h-[120px]">
          {clues.length===0 ? <p>No clues</p> : (
            <div>
              <p className="text-lg">{clues[currentIndex].text}</p>
              {clues[currentIndex].media && <img src={clues[currentIndex].media} alt="media" className="mt-2 max-h-48" />}
            </div>
          )}
        </div>

        <div className="mt-4">
          <input value={teamCode} onChange={e=>setTeamCode(e.target.value)} placeholder="Enter your team code" className="px-3 py-2 border rounded w-full" />
          <button onClick={submitTeam} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">Enter / Scan</button>
        </div>
      </div>
    </div>
  )
}
