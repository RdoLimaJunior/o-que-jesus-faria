import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // GET: Fetch all prayers
  if (req.method === 'GET') {
    try {
      const { rows: prayers } = await sql`SELECT id, text, created_at, is_answered FROM Prayers ORDER BY created_at DESC;`;
      return res.status(200).json(prayers);
    } catch (error) {
      console.error('Failed to fetch prayers:', error);
      return res.status(500).json({ error: 'Failed to fetch prayers' });
    }
  }

  // POST: Add a new prayer
  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text is required' });

      await sql`INSERT INTO Prayers (text) VALUES (${text});`;
      return res.status(201).json({ message: 'Prayer added successfully' });
    } catch (error) {
      console.error('Failed to add prayer:', error);
      return res.status(500).json({ error: 'Failed to add prayer' });
    }
  }

  // PUT: Update a prayer (e.g., mark as answered)
  if (req.method === 'PUT') {
    try {
      const { id, is_answered } = req.body;
      if (!id || is_answered === undefined) return res.status(400).json({ error: 'ID and is_answered are required' });

      await sql`UPDATE Prayers SET is_answered = ${is_answered} WHERE id = ${id};`;
      return res.status(200).json({ message: 'Prayer updated successfully' });
    } catch (error) {
      console.error('Failed to update prayer:', error);
      return res.status(500).json({ error: 'Failed to update prayer' });
    }
  }

  // DELETE: Remove a prayer
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await sql`DELETE FROM Prayers WHERE id = ${id};`;
      return res.status(200).json({ message: 'Prayer deleted successfully' });
    } catch (error) {
      console.error('Failed to delete prayer:', error);
      return res.status(500).json({ error: 'Failed to delete prayer' });
    }
  }

  // Handle other methods
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}