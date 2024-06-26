import { getSession } from 'next-auth/client';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async (req, res) => {
  const session = await getSession({ req });

  if (!session || !session.user.isAdmin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    const client = await pool.connect();
    const usersResult = await client.query('SELECT * FROM users');
    const artistsResult = await client.query('SELECT * FROM artists');
    const songsResult = await client.query('SELECT * FROM songs');
    client.release();
    res.status(200).json({
      users: usersResult.rows,
      artists: artistsResult.rows,
      songs: songsResult.rows,
    });
  } else if (req.method === 'DELETE') {
    const { songId } = req.body;
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM songs WHERE id=$1', [songId]);
      res.status(200).json({ message: 'Song deleted' });
    } catch (err) {
      res.status(400).json({ error: 'Song deletion failed' });
    } finally {
      client.release();
    }
  }
};
