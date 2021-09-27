const express = require('express')
require('dotenv').config()
const PORT = process.env.PORT || 8080
const app = express()
const path = require('path')
const cors = require('cors')

const lid = require('./routes/lid.route')
const reviews = require('./routes/reviews.route')
const posts = require('./routes/posts.route')
const magnets = require('./routes/magnets.route')

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/documentation', express.static('./out'))
app.use('/public', express.static('./public'))

app.get('/api', (req, res) => {
  res.sendFile(path.resolve(__dirname, './out/index.html'))
})

app.use('/api/lid/', lid)
app.use('/api/reviews/', reviews)
app.use('/api/posts/', posts)
app.use('/api/magnets/', magnets)

app.all('*', (req, res) => {
  res.status(404).send('resourse not found')
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} ...`)
})
