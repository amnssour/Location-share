const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_TOKEN = '20051213';

let latest = null;

app.use(express.json({ limit: '10kb' }));

// Allow geolocation for this website itself
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(self)');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Receive location only after the visitor explicitly grants permission
app.post('/api/location', (req, res) => {
  const { latitude, longitude, accuracy } = req.body || {};

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(accuracy)
  ) {
    return res.status(400).json({
      error: 'Invalid location data'
    });
  }

  latest = {
    latitude,
    longitude,
    accuracy,
    receivedAt: new Date().toISOString()
  };

  res.json({
    ok: true
  });
});

// Admin endpoint
app.get('/api/location', (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  if (!latest) {
    return res.json({
      message: 'No location received yet'
    });
  }

  res.json(latest);
});

app.get('/api/status', (req, res) => {
  res.json({
    online: true,
    locationReceived: latest !== null
  });
});

app.listen(PORT, () => {
  console.log(`Location demo running on port ${PORT}`);
});
