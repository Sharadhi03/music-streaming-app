import { getSession } from 'next-auth/client';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { songId } = req.query;

  const client = await pool.connect();
  const result = await client.query('SELECT * FROM stats WHERE song_id=$1', [songId]);
  client.release();

  if (result.rows.length > 0) {
    res.status(200).json(result.rows[0]);
  } else {
    res.status(404).json({ error: 'Stats not found' });
  }
};
