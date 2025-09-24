import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { rows } = await sql`SELECT count FROM counters WHERE id = 1;`;
    return res.json({ count: rows[0]?.count ?? 0 });
  }

  if (req.method === "POST") {
    const { rows } = await sql`
      UPDATE counters SET count = count + 1 WHERE id = 1 RETURNING count;
    `;
    return res.json({ count: rows[0]?.count });
  }
}
