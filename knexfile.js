// Update with your config settings.
const DEBUG = process.env.NODE_ENV !== 'production'
const fs = require('fs')

require('dotenv')
console.log(`AT KNEX FILE PROCESS ENV`)
console.log({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_ROLE,
  password: process.env.POSTGRES_PASSWORD,
})
module.exports = {

  client: 'postgresql',

  development: {
    client: 'postgresql',
    connection: {
      client: 'postgresql',
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DATABASE || 'alfred_dev',
      user: process.env.POSTGRES_ROLE,
      password: process.env.POSTGRES_PASSWORD,
    },
    // seeds: {
    //   directory: './seeds/development'
    // }
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_ROLE,
      password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 30
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_ROLE,
      password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 30
    },
    // seeds: {
    //   directory: './seeds/shared'
    // }
  }

};
