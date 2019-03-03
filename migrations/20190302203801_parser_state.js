
exports.up = function(knex, Promise) {
  return knex.schema.createTable('parser_state', table => {
    table.increments('id')
    table.timestamp('parse_start')
    table.timestamp('parse_end')
    table.integer('deleted_posts')
    table.integer('affected_threads')
    table.integer('new_threads')
    table.integer('ended_threads')
    table.integer('deleted_threads')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('parser_state')
};
