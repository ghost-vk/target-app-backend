require('dotenv').config()
const express = require('express')
const isProduction = process.env.NODE_ENV === 'production'
const PORT = isProduction
  ? process.env.PRODUCTION_PORT
  : process.env.LOCALHOST_PORT
const app = express()
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error.middleware')
const vhost = require('./middleware/vhost.middleware')

const lid = require('./routes/lid.route')
const reviews = require('./routes/reviews.route')
const posts = require('./routes/posts.route')
const magnets = require('./routes/magnets.route')
const auth = require('./routes/auth.route')

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
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

const adminApp = express()
adminApp.use('/', express.static('./../target-app-admin/dist/spa'))
adminApp.get('/', (req, res) => {
  res.send('Subdomain!')
})
app.use(vhost(`admin.${clientUrl.split('//')[1]}`, adminApp))

app.use('/documentation', express.static('./out'))
app.use('/public', express.static('./public'))
app.use('/', express.static('./../target-app-client-main/dist'))
app.use('/s', express.static('./../target-app-static-documents/public'))
app.use('/api/lid/', lid)
app.use('/api/reviews/', reviews)
app.use('/api/posts/', posts)
app.use('/api/magnets/', magnets)
app.use('/api/auth/', auth)

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
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} ...`)
    })
  } catch (err) {
    console.log(err)
  }
}
start()
