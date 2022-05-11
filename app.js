const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const debug = require('debug')('http')

const errorMiddleware = require('./middleware/error.middleware')
const authStaticMiddleware = require('./middleware/auth-static.middleware')

const lidRoute = require('./routes/lid.route')
const reviewsRoute = require('./routes/reviews.route')
const postsRoute = require('./routes/posts.route')
const magnetsRoute = require('./routes/magnets.route')
const authRoute = require('./routes/auth.route')
const mediaLibraryRoute = require('./routes/media-library.route')
const bannersRoute = require('./routes/banners.route')
const usersRoute = require('./routes/users.route')
const healthCheckRoute = require('./routes/health-check.route')

const app = express()

const PORT = process.env.PORT
const corsOrigins = process.env.ORIGINS ? process.env.ORIGINS.split(',') : []

app.use(cors({ origin: corsOrigins, credentials: true }))

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use('/api/courses-media', authStaticMiddleware, express.static('./../courses-media'))
app.use('/api/health-check/', healthCheckRoute)
app.use('/api/lid/', lidRoute)
app.use('/api/reviews/', reviewsRoute)
app.use('/api/posts/', postsRoute)
app.use('/api/magnets/', magnetsRoute)
app.use('/api/auth/', authRoute)
app.use('/api/media-library/', mediaLibraryRoute)
app.use('/api/banners/', bannersRoute)
app.use('/api/users/', usersRoute)

app.all('*', (req, res) => {
  res.status(404).json({ error: '404' })
})

app.use(errorMiddleware)

;(function () {
  try {
    app.listen(PORT, () => {
      debug('Server started on port %s ...', PORT)
    })
  } catch (err) {
    debug('Error occurs when start server:\n%O', err)
  }
})()
