import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import bcrypt from "bcryptjs";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default NextAuth({
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        const client = await pool.connect();
        const res = await client.query('SELECT * FROM users WHERE email=$1', [email]);
        client.release();

        if (res.rows.length > 0) {
          const user = res.rows[0];
          const isValid = await bcrypt.compare(password, user.password);
          if (isValid) {
            return { id: user.id, name: user.username, email: user.email };
          }
        }
        throw new Error('Invalid email or password');
      }
    })
  ],
  database: process.env.DATABASE_URL
});
