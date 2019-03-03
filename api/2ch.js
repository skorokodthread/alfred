const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const axios = require('axios')
const TwoChannel = require('../core/2ch')
const _ = require('lodash')
const { asyncFn } = require('../middleware')
const { check } = require('express-validator/check')

router.get('/', asyncFn(async (req, res) => {
  const t = await TwoChannel.getAllThreads()
  const data = await TwoChannel.storeThreads(t)
  res.send(data)
}))

router.get('/threads', [ check('page', 'page должен быть интом').isInt() ], asyncFn(async (req, res) => {
  const threads = await TwoChannel.getStoredThreads(req.params.page || 0)
  const deleted_threads = await TwoChannel.getDeletedThreads(req.params.deleted_page || 0)
  res.send({
    threads,
    deleted_threads
  })
}))

router.get('/threads/:thread_id', [ check('thread_id', 'thread_id должен быть биг интом').isInt() ] , asyncFn(async (req, res) => {
  const thread = await TwoChannel.getPostsForStoredThread(req.params.thread_id)
  res.send(thread)
}))

module.exports = router