const BaseModel = require('./BaseModel')

// Person model.
class ParserStateModel extends BaseModel {
  static get tableName() {
    return 'parser_state'
  }

  static get idColumn() {
    return 'id'
  }

}

module.exports = ParserStateModel
