const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const debug = require('debug')('http');

const errorMiddleware = require('./middleware/error.middleware');

const leadRoute = require('./routes/lead.route');
const reviewsRoute = require('./routes/reviews.route');
const postsRoute = require('./routes/posts.route');
const magnetsRoute = require('./routes/magnets.route');
const bannersRoute = require('./routes/banners.route');

const app = express();

const PORT = process.env.PORT;
const corsOrigins = process.env.ORIGINS ? process.env.ORIGINS.split(',') : [];

app.use(cors({ origin: corsOrigins, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/lid/', leadRoute);
app.use('/api/reviews/', reviewsRoute);
app.use('/api/posts/', postsRoute);
app.use('/api/magnets/', magnetsRoute);
app.use('/api/banners/', bannersRoute);

app.all('*', (req, res) => {
  res.status(404).json({ error: '404' });
});

app.use(errorMiddleware);
(function () {
  try {
    app.listen(PORT, () => {
      debug('Server started on port %s ...', PORT);
    });
  } catch (err) {
    debug('Error occurs when start server:\n%O', err);
  }
})();
