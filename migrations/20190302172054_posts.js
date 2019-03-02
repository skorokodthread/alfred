
exports.up = function(knex, Promise) {
  return knex.schema.createTable('posts', table => {
    table.bigInteger('thread_id').references('thread_id').inTable('threads').notNullable().onDelete('CASCADE')
    table.bigInteger('post_id').notNullable().primary()
    table.boolean('op_post').defaultTo(false)
    table.boolean('deleted').defaultTo(false)
    table.timestamp('deleted_at')
    table.text('comment')
    table.timestamp('post_date').notNullable()
    table.text('post_date_pretty').notNullable()
    table.text('author').notNullable()
    table.boolean('banned').defaultTo(false)
    table.boolean('closed').defaultTo(false)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('posts')
};
