const axios = require('axios')
const { ThreadModel, PostModel, ParserStateModel } = require('../models')
const { transaction } = require('objection')
const _ = require('lodash')
const fs = require('fs')

async function retryUntilOk(fn) {
  try {
    return await fn()
  } catch (e) {
    return await retryUntilOk(fn)
  }
}

class TwoChannel {
  constructor() {
    this.board = 'b'
    this.url = `https://2ch.hk/${this.board}`
  }

  async getAllThreads() {
    try {
      const res = await axios.get(this.url + '/threads.json')
      if (!res.data.threads) return []
      const threadsExceptFap = res.data.threads.filter(t => !t.subject.includes('ФАП') && !t.subject.includes('ТРЕД'))
      // return [threadsExceptFap[0]]
      return threadsExceptFap
    } catch (e) {
      console.log(`Error at get threads`, e)
      return []
    }
  }

  async getDeletedThreads(page) {
    try {
      const { results: threads } = await ThreadModel
        .query()
        .where({ thread_deleted: true })
        .orWhere({ thread_ended: true })
        .page(page, 10)
      await ThreadModel.loadRelated(threads, 'posts')
      return threads
    } catch (e) {
      console.log(`Error at get deleted threads`, e)
      throw e
    }
  }

  async getStoredThreads(page) {
    try {
      const { results: threads } = await ThreadModel
        .query()
        .where({ thread_deleted: false, thread_ended: false })
        .page(page, 10)
      await ThreadModel.loadRelated(threads, 'posts')
      threads.forEach(t => {
        if (t.posts.filter(t => t.deleted).length) {
          t.touched_by_mod = true
        }
      })
      return threads
    } catch (e) {
      console.log(`Error at get stored threads`, e)
      throw e
    }
  }

  async getPostsForStoredThread(thread_id) {
    const thread = await ThreadModel.query().where({ thread_id }).first()
    if (!thread) throw new Error(`Нет такого треда`)
    await ThreadModel.loadRelated([thread], 'posts')
    return thread
  }

  async getPosts(thread_id, trx) {
    const res = await retryUntilOk(async () => await axios({
      method: 'GET',
      transformResponse: [(response) => (JSON.parse(response))],
      url: `${this.url}/res/${thread_id}.json`
    }))
    // console.log(`Data`, res.data.threads[0].posts)
    return res.data.threads[0].posts
  }

  async startParse() {
    const started = await ParserStateModel.query().where({
      parse_end: null
    }).first()
    if (started) throw new Error(`Парсинг уже начат`)
    await ParserStateModel.query().insert({
      parse_start: new Date()
    })
    return true
  }

  /**
   *
   * @param data {Object}
   * @param {number} data.deleted_posts Количество удаленных мочой постов
   * @param {number} data.affected_threads Количество тредов, где побывал мод
   * @param {number} data.new_threads Количество созданных тредов с последнего парса
   * @returns {Promise<boolean>}
   */
  async endParse(data) {
    const startedParse = await ParserStateModel.query().where({
      parse_end: null
    }).first()
    if (!startedParse) throw new Error(`Парсинг еще не начат или уже закончен`)
    await ParserStateModel.query().where({
      id: startedParse.id
    }).patch({
      ...data,
      parse_end: new Date()
    })
  }

  async storeThreads(threads) {
    await this.startParse()
    let newThreads = 0
    let affectedThreads = 0
    let postsDeletedInAllThreads = 0
    let deletedThreads = 0
    let endedThreads = 0
    const threadsIds = threads.map(t => Number(t.num))
    const now = Date.now()
    const deletedOrEndedThreads = await ThreadModel
      .query()
      .select(['thread_id', 'last_activity'])
      .whereNotIn('thread_id', threadsIds)
      .andWhere({ thread_deleted: false, thread_ended: false })
    await Promise.all(deletedOrEndedThreads.map(async t => {
      const threadActivityDelta = now - new Date(t.last_activity).getTime()
      const hour = 3600000
      const data = {
        thread_deleted: false,
        thread_ended: false,
      }
      if (threadActivityDelta < hour * 2) {
        data.thread_deleted = true
        deletedThreads += 1
      } else {
        data.thread_ended = true
        endedThreads += 1
      }
      await ThreadModel.query().where({
        thread_id: t.thread_id
      }).patch(data)
    }))
    await Promise.all(threads.map(async t => {
      const posts = await this.getPosts(t.num)
      const thread_id = Number(t.num)
      const isThreadExists = await ThreadModel.query().where({ thread_id }).first()
      if (isThreadExists) {
        await ThreadModel.query().where({ thread_id }).patch({
          posts_count: posts.length,
          views: t.views,
          last_activity: new Date(Number(`${t.lasthit}000`)),
        })
        const stored_posts = await PostModel.query().where({ thread_id, deleted: false })
        // Если пришло постов меньше, чем было до этого парса, то что-то удалили
        stored_posts.sort((a,b) => a.post_date - b.post_date)
        posts.sort((a,b) => a.timestamp - b.timestamp)
        const storedPostsIds = stored_posts.map(p => Number(p.post_id))
        const actualPostsIds = posts.map(p => Number(p.num))
        // console.log(`Actual posts`, actualPostsIds)
        // console.log(`Stored posts`, storedPostsIds)
        const deletedPosts = storedPostsIds.filter(id => !actualPostsIds.includes(id))
        if (deletedPosts.length) {
          console.log(`Deleted posts`, deletedPosts)
          affectedThreads += 1
          postsDeletedInAllThreads += deletedPosts.length
          await PostModel.query().whereIn('post_id', deletedPosts).patch({
            deleted: true,
            deleted_at: new Date()
          })
        }
      } else {
        newThreads += 1
        console.log(`New thread: ${thread_id}`)
        await ThreadModel.query().insertGraph({
          thread_id,
          comment: t.comment,
          subject: t.subject,
          views: t.views,
          posts_count: posts.length > t.posts_count ? posts.length : t.posts_count,
          create_date: new Date(Number(`${t.timestamp}000`)),
          last_activity: new Date(Number(`${t.lasthit}000`)),
          posts: posts.map(p => ({
            thread_id,
            post_id: p.num,
            banned: Boolean(p.banned),
            closed: Boolean(p.closed),
            op_post: Boolean(p.op),
            post_date: new Date(Number(`${p.timestamp}000`)),
            post_date_pretty: p.date,
            author: p.name || 'Аноним',
            comment: p.comment || null
          }))
        })
      }
    }))
    const d = {
      affected_threads: affectedThreads,
      new_threads: newThreads,
      deleted_posts: postsDeletedInAllThreads,
      ended_threads: endedThreads,
      deleted_threads: deletedThreads
    }
    console.log(`Finished`, d)
    await this.endParse(d)
    return d
  }
}

module.exports = new TwoChannel()