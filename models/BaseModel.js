const { Model } = require('objection');
const Knex = require('knex');

// Initialize knex.
const knex = Knex({
  client: 'postgresql',
  useNullAsDefault: true,
  connection: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DATABASE || 'alfred_dev',
    user: process.env.POSTGRES_ROLE,
    password: process.env.POSTGRES_PASSWORD
  }
});

// Give the knex object to objection.
Model.knex(knex);

class BaseModel extends Model {
  static get modelPaths() {
    return [__dirname];
  }
}

module.exports = BaseModel
