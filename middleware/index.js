const _ = require('lodash')
const { validationResult } = require('express-validator/check')

const asyncFn = fn => (req, res, next) => {
  const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Build your resulting errors however you want! String, object, whatever - it works!
    return `Invalid value at ${location} in field ${param}: ${msg}`;
  }
  const errors = validationResult(req).formatWith(errorFormatter)
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.mapped())
  }
  Promise.resolve(fn(req, res, next)).catch((e) => {
    console.log(`Error at some endpoint`, e)
    return res.send(500)
  })
}

module.exports = {
  asyncFn
}