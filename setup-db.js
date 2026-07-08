import { sql } from '@vercel/postgres';
import psalmsData from '../salmos.json';

export default async function handler(req, res) {
  try {
    // Create Prayers table
    await sql`
      CREATE TABLE IF NOT EXISTS Prayers (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_answered BOOLEAN DEFAULT FALSE
      );
    `;

    // Create Psalms table
    await sql`
      CREATE TABLE IF NOT EXISTS Psalms (
        number INT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        author VARCHAR(100),
        text TEXT
      );
    `;

    // Populate Psalms table if it's empty
    const { rowCount } = await sql`SELECT 1 FROM Psalms LIMIT 1;`;
    if (rowCount === 0) {
      for (const psalm of psalmsData.salmos) {
        await sql`
          INSERT INTO Psalms (number, title, type, author, text)
          VALUES (${psalm.numero}, ${psalm.titulo}, ${psalm.tipo}, ${psalm.autor}, ${psalm.texto || null})
          ON CONFLICT (number) DO NOTHING;
        `;
      }
    }

    return res.status(200).json({ message: 'Database setup complete. Tables "Prayers" and "Psalms" are ready.' });
  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ error: error.message });
  }
}