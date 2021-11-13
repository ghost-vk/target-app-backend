require('dotenv').config()
const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')
const isProduction = process.env.NODE_ENV === 'production'
const PORT = isProduction
  ? process.env.PRODUCTION_PORT
  : process.env.LOCALHOST_PORT
const app = express()
const path = require('path')
const cors = require('cors')
const history = require('connect-history-api-fallback')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error.middleware')
const vhost = require('./middleware/vhost.middleware')

const lid = require('./routes/lid.route')
const reviews = require('./routes/reviews.route')
const posts = require('./routes/posts.route')
const magnets = require('./routes/magnets.route')
const auth = require('./routes/auth.route')
const mediaLibrary = require('./routes/media-library.route')

const clientUrl = isProduction
  ? process.env.PRODUCTION_CLIENT_URL
  : process.env.LOCAL_CLIENT_URL

app.use(
  cors({
    origin: [
      clientUrl,
      `${clientUrl.split('//')[0]}//admin.${clientUrl.split('//')[1]}`,
    ],
    credentials: true,
  })
)

if (isProduction && process.env.PRODUCTION_CLIENT_URL !== 'http://localhost') {
  app.use((req, res, next) => {
    if (req.secure) {
      next()
    } else {
      res.redirect('https://' + req.headers.host + req.url)
    }
  })
}

app.use(express.json())
app.use(cookieParser())

// Next line should be before history() middleware
app.use(express.static(__dirname + '/secret', { dotfiles: 'allow' }))
app.use(express.urlencoded({ extended: true }))

app.use('/documentation', express.static('./out'))
app.use('/public', express.static('./public'))
app.use('/s', express.static('./../target-app-static-documents/public'))
app.use('/api/lid/', lid)
app.use('/api/reviews/', reviews)
app.use('/api/posts/', posts)
app.use('/api/magnets/', magnets)
app.use('/api/auth/', auth)
app.use('/api/media-library/', mediaLibrary)

app.use(history())
app.use('/', express.static('./../target-app-client-main/dist'))

const adminApp = express()
adminApp.use('/', express.static('./../target-app-admin/dist/spa'))
app.use(vhost(`admin.${clientUrl.split('//')[1]}`, adminApp))

app.all('*', (req, res) => {
  res
    .status(404)
    .sendFile(
      path.resolve(
        __dirname,
        './../target-app-static-documents/public/404.html'
      )
    )
})

app.use(errorMiddleware)

const start = async () => {
  try {
    // http
    const httpServer = http.createServer(app)
    httpServer.listen(PORT, () => {
      console.log(`Server started on port ${PORT} ...`)
    })

    // https
    if (
      isProduction &&
      process.env.PRODUCTION_CLIENT_URL !== 'http://localhost'
    ) {
      const httpsServer = https.createServer(
        {
          key: fs.readFileSync(
            '/etc/letsencrypt/live/anastasi-target.ru/privkey.pem'
          ),
          cert: fs.readFileSync(
            '/etc/letsencrypt/live/anastasi-target.ru/cert.pem'
          ),
          ca: fs.readFileSync(
            '/etc/letsencrypt/live/anastasi-target.ru/chain.pem'
          ),
        },
        app
      )
      httpsServer.listen(443, () => {
        console.log('HTTPS Server started on port 443 ...')
      })
    }
  } catch (err) {
    console.log(err)
  }
}
start()
