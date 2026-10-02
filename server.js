const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'CHANGE_THIS_TOKEN';
let latest = null;

app.use(express.json({limit:'10kb'}));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/location', (req,res)=>{
  const { latitude, longitude, accuracy } = req.body || {};
  if (![latitude,longitude,accuracy].every(Number.isFinite)) return res.status(400).json({error:'Invalid location'});
  latest = { latitude, longitude, accuracy, receivedAt: new Date().toISOString() };
  res.json({ok:true});
});

app.get('/api/location', (req,res)=>{
  if (req.query.token !== ADMIN_TOKEN) return res.status(401).json({error:'Unauthorized'});
  res.json(latest || {message:'No location received yet'});
});

app.listen(PORT, ()=>console.log(`Location demo running on port ${PORT}`));
