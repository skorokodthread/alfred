const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const logStartupMain = require('debug')('startup:main')
const DEBUG = process.env.NODE_ENV !== 'production'
const axios = require('axios')
const app = express()
const Knex = require('knex');
const PROJECT_NAME = 'Alfred'

let server

const start = function() {
  require('dotenv')
  app.use(bodyParser.json())
  app.use((req, res, next) => {

    const allowed = ['http://localhost:9000']

    if (allowed.indexOf(req.headers.origin) > -1) {
      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Credentials', true)
      res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH')
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-HTTP-Method-Override, Cookie, Cookies')
      }
    }

    next()

  })
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err)
    logStartupMain(`Startup error`, err)
    res.status(500).send('Internal error occurred, hold on')
  })
  app.use('/api/2ch', require('./api/2ch'))

  server = app.listen(4000, () => {
    logStartupMain('Listen on 4000 port')
    console.log(`${PROJECT_NAME} back started. Enjoy`)
  })

}

start()