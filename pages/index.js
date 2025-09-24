import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r=>r.json())

export default function Home() {
  const { data } = useSWR('/api/qrs/public', fetcher)
  const qrs = data?.qrs || []
  return (
    <div className="container">
      <header className="flex items-center justify-between py-6">
        <h1 className="text-3xl font-bold">Campus Treasure Hunt</h1>
        <div>
          <Link href="/admin"><a className="px-4 py-2 bg-blue-600 text-white rounded">Admin</a></Link>
        </div>
      </header>

      <main>
        <section className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold">How to play</h2>
          <p className="mt-2">Scan QR codes around campus. Each QR shows rotating clues and questions. Teams have limited skips. Final QR may be locked.</p>
          <p className="mt-4">Teams: create your team code on the QR Direct screen when you scan a QR.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {qrs.map(q => (
            <div key={q.id} className="p-4 bg-white rounded shadow">
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm">Code: {q.code} — {q.type}</p>
              <div className="mt-2 flex gap-2">
                <Link href={'/qr/'+q.code}><a className="px-3 py-2 bg-green-600 text-white rounded">Open (simulate scan)</a></Link>
                <a href={`/api/qrs/${q.code}/qr`} className="px-3 py-2 bg-gray-200 rounded">Download QR</a>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
