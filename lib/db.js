// lib/db.js
import { sql } from "@vercel/postgres";

/**
 * Admins
 */
export async function createAdmin(username, passwordHash) {
  await sql`
    INSERT INTO admins (username, password_hash)
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO NOTHING
  `;
}

export async function getAdminByUsername(username) {
  const { rows } = await sql`
    SELECT * FROM admins WHERE username = ${username} LIMIT 1
  `;
  return rows[0];
}

/**
 * QRs
 */
export async function createQR(code, title, type = "basic", clues = [], rotateSeconds = 15) {
  const { rows } = await sql`
    INSERT INTO qrs (code, title, type, clues_json, rotate_seconds)
    VALUES (${code}, ${title}, ${type}, ${JSON.stringify(clues)}, ${rotateSeconds})
    RETURNING *
  `;
  return rows[0];
}

export async function getQRByCode(code) {
  const { rows } = await sql`
    SELECT * FROM qrs WHERE code = ${code} LIMIT 1
  `;
  return rows[0];
}

/**
 * Scans
 */
export async function recordScan(qrId, teamCode, userAgent, ip, extra = {}) {
  await sql`
    INSERT INTO scans (qr_id, team_code, user_agent, ip, extra_json)
    VALUES (${qrId}, ${teamCode}, ${userAgent}, ${ip}, ${JSON.stringify(extra)})
  `;
}

export async function getScansByQR(qrId) {
  const { rows } = await sql`
    SELECT * FROM scans WHERE qr_id = ${qrId} ORDER BY timestamp DESC
  `;
  return rows;
}

/**
 * Teams
 */
export async function createTeam(code, name, members = [], skips = 2, premium = 0) {
  const { rows } = await sql`
    INSERT INTO teams (code, name, members_json, skips, premium)
    VALUES (${code}, ${name}, ${JSON.stringify(members)}, ${skips}, ${premium})
    RETURNING *
  `;
  return rows[0];
}

export async function getTeamByCode(code) {
  const { rows } = await sql`
    SELECT * FROM teams WHERE code = ${code} LIMIT 1
  `;
  return rows[0];
}

/**
 * Settings
 */
export async function setSetting(key, value) {
  await sql`
    INSERT INTO settings (k, v)
    VALUES (${key}, ${value})
    ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v
  `;
}

export async function getSetting(key) {
  const { rows } = await sql`
    SELECT v FROM settings WHERE k = ${key} LIMIT 1
  `;
  return rows[0]?.v ?? null;
}
