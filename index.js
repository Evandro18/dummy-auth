const express = require('express');
const cors = require('cors');
const { v4: uuid, validate } = require('uuid');

const app = express();
app.use(cors())
app.use(express.json())

const db = { 'meuuser': { pass: '123456', token: null }};
const validTokens = [];

app.post('/auth', (req, res, next) => {
  try {
    const basic = req.headers['authorization'];
    if (!basic) return res.status(401).json();
    const [username, pass] = Buffer.from(basic.replace(/Basic\s/, ''), 'base64').toString('utf-8').split(':');
    if (!username || !pass) return res.status(401).json();

    const found = db[username];
    if (!found || (pass !== found.pass)) return res.status(403).json();

    const token = uuid();
    found.token = token;
    validTokens.push(token);
    db[username] = found;

    const response =  {
      accessToken: token,
      message: 'success'
    }

    return res.status(201).json(response)
  } catch (error) {
    return res.status(500).json({ message: 'Oh no! Something went wrong...' });
  }
});

app.get('/test-route', (req, res, next) => {
  const auth = req.headers['authorization'].replace(/Bearer\s/, '');
  if (!auth) return res.status(401).json();
  if (validTokens.includes(auth)) return res.status(200).json({ message: 'tudo certo' });
  return res.status(403).json();
})

app.use('*', (req, res, next) => {
  return res.status(404).json({ message: 'Route not found' });
})

app.listen(3000, () => console.log('Server is running on port 3000'));