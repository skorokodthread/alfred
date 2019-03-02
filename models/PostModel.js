const BaseModel = require('./BaseModel')

// Person model.
class PostModel extends BaseModel {
  static get tableName() {
    return 'posts'
  }

  static get idColumn() {
    return 'post_id'
  }

}

module.exports = PostModel
