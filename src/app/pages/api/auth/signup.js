import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'User creation failed' });
  } finally {
    client.release();
  }
};
