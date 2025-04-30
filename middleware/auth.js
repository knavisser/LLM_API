export default function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const parts = authHeader.split(' ');

  // Expect header: Authorization: ApiKey <your-key>
  if (parts.length !== 2 || parts[0] !== 'ApiKey') {
    return res.status(401).json({ error: 'Invalid authorization scheme' });
  }

  const apiKey = parts[1];

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}
