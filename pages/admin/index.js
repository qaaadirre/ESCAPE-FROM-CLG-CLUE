import { useState, useEffect } from 'react'
import Router from 'next/router'
import dynamic from 'next/dynamic'

export default function Admin() {
  const [token, setToken] = useState('')
  const [qrs, setQrs] = useState([])
  const [form, setForm] = useState({code:'', title:'', type:'basic', clues_json:'[]'})
  const [liveScanCount, setLiveScanCount] = useState(0)
  useEffect(()=>{
    const t = localStorage.getItem('admin_token')
    if(t) {
      setToken(t)
      load()
    }
  },[])

  const login = async () => {
    const username = prompt('Admin username','admin')
    const password = prompt('Admin password','password123')
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})})
    const j = await res.json()
    if(j.token){ localStorage.setItem('admin_token', j.token); setToken(j.token); load(); alert('Logged in') }
    else alert('Login failed')
  }

  const load = async () => {
    const res = await fetch('/api/qrs',{headers:{'authorization':'Bearer '+localStorage.getItem('admin_token')}})
    const j = await res.json()
    setQrs(j.qrs || [])
  }

  const createQR = async () => {
    const payload = {...form}
    try {
      payload.clues_json = JSON.stringify(JSON.parse(payload.clues_json))
    } catch(e) { alert('clues_json must be valid JSON (array)'); return }
    const res = await fetch('/api/qrs',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+localStorage.getItem('admin_token')},body:JSON.stringify(payload)})
    const j = await res.json()
    alert(j.message || 'ok'); load()
  }

  const exportCsv = () => {
    window.location = '/api/analytics/export?format=csv'
  }

  useEffect(()=>{
    (async ()=>{
      // dynamic import socket on client
      const io = (await import('socket.io-client')).default;
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const socket = io(base, { transports: ['websocket'], path: '/socket.io' });
      socket.on('connect', ()=> console.log('socket connected'));
      socket.on('scan', (p)=>{ setLiveScanCount(c=>c+1) });
      // you can join rooms if needed
    })();
  },[])

  return (
    <div className="container p-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Panel</h1><div className="text-sm text-gray-600">Live scans: {liveScanCount}</div>
        <div>
          {!token ? <button onClick={login} className="px-3 py-2 bg-blue-600 text-white rounded">Login</button> 
          : <button onClick={()=>{localStorage.removeItem('admin_token'); setToken(''); setQrs([])}} className="px-3 py-2 bg-gray-200 rounded">Logout</button>}
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Create QR</h2>
          <input placeholder="Code" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} className="w-full mt-2 px-2 py-1 border rounded"/>
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full mt-2 px-2 py-1 border rounded"/>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full mt-2 px-2 py-1 border rounded">
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
          <textarea placeholder='clues_json e.g. [{"text":"one","media":null}]' value={form.clues_json} onChange={e=>setForm({...form,clues_json:e.target.value})} className="w-full mt-2 px-2 py-1 border rounded h-28"/>
          <button onClick={createQR} className="mt-3 px-3 py-2 bg-green-600 text-white rounded">Create</button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Existing QRs</h2>
          <div className="mt-2">
            {qrs.map(q=>(
              <div key={q.id} className="p-2 border rounded mb-2">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{q.title} ({q.code})</div>
                    <div className="text-sm">Type: {q.type} | Active: {q.active}</div>
                  </div>
                  <div className="flex gap-2">
                    <a className="px-2 py-1 bg-gray-200 rounded" href={`/api/qrs/${q.code}/qr`} target="_blank">QR</a>
                    <button className="px-2 py-1 bg-blue-200 rounded" onClick={async ()=>{await fetch('/api/qrs/'+q.code+'/toggle',{method:'POST',headers:{'authorization':'Bearer '+localStorage.getItem('admin_token')}}); load()}}>Toggle</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button onClick={exportCsv} className="px-3 py-2 bg-indigo-600 text-white rounded">Export Analytics CSV</button>
          </div>
        </div>
      </section>
    </div>
  )
}
