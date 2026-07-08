import { sql } from "@vercel/postgres";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  // GET: Fetch a reflection for a specific psalm
  if (req.method === "GET") {
    const { psalm_number } = req.query;
    if (!psalm_number) return res.status(400).json({ error: "Psalm number is required" });

    try {
      const { rows } = await sql`SELECT text FROM Reflections WHERE user_id = ${userId} AND psalm_number = ${psalm_number};`;
      return res.status(200).json(rows[0] || { text: '' });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch reflection" });
    }
  }

  // POST: Save or update a reflection (UPSERT)
  if (req.method === "POST") {
    const { psalm_number, text } = req.body;
    if (!psalm_number || text === undefined) return res.status(400).json({ error: "Psalm number and text are required" });

    try {
      await sql`
        INSERT INTO Reflections (user_id, psalm_number, text)
        VALUES (${userId}, ${psalm_number}, ${text})
        ON CONFLICT (user_id, psalm_number)
        DO UPDATE SET text = EXCLUDED.text, updated_at = CURRENT_TIMESTAMP;
      `;
      return res.status(200).json({ message: "Reflection saved successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to save reflection" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}