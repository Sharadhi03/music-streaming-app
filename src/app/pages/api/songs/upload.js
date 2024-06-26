import { getSession } from 'next-auth/client';
import { Pool } from 'pg';
import multer from 'multer';
import nextConnect from 'next-connect';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
  }),
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single('file'));

apiRoute.post(async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { artistId, title, genre } = req.body;
  const url = `/uploads/${req.file.filename}`;

  const client = await pool.connect();
  try {
    await client.query('INSERT INTO songs (artist_id, title, genre, url) VALUES ($1, $2, $3, $4)', [artistId, title, genre, url]);
    res.status(201).json({ message: 'Song uploaded' });
  } catch (err) {
    res.status(400).json({ error: 'Song upload failed' });
  } finally {
    client.release();
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};
