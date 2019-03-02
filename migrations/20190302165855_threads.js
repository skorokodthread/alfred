
exports.up = function(knex, Promise) {
  return knex.schema.createTable('threads', table => {
    table.increments('id')
    table.bigInteger('thread_id').notNullable().unique()
    table.text('subject').notNullable()
    table.text('comment').notNullable()
    table.integer('posts_count').notNullable()
    table.timestamp('create_date').notNullable()
    table.timestamp('last_activity').notNullable()
    table.integer('views').notNullable()
    table.boolean('thread_deleted').notNullable().defaultTo(false)
    table.boolean('thread_ended').notNullable().defaultTo(false)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('threads')
};
