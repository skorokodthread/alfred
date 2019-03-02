const BaseModel = require('./BaseModel')
const PostModel = require('./PostModel')
const { Model } = require('objection')

// Person model.
class ThreadModel extends BaseModel {
  static get tableName() {
    return 'threads'
  }

  static get idColumn() {
    return 'id'
  }

  static get relationMappings() {
    return {
      posts: {
        relation: Model.HasManyRelation,
        modelClass: PostModel,
        join: {
          from: 'threads.thread_id',
          to: 'posts.thread_id'
        }
      }
    }
  }

}

module.exports = ThreadModel
