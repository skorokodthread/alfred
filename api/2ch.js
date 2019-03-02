const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const axios = require('axios')
const TwoChannel = require('../core/2ch')
const _ = require('lodash')
const { asyncFn } = require('../middleware')

router.get('/', asyncFn(async (req, res) => {
  const t = await TwoChannel.getAllThreads()
  const { affected_threads, new_threads, deleted_posts } = await TwoChannel.storeThreads(t)
  res.send({
    affected_threads,
    new_threads,
    deleted_posts
  })
}))

module.exports = router