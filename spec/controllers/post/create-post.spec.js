'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const Post = require('../../../src/models/post')
const reqResNext = require('../../fixtures/req-res-next')
const createPost = require('../../../src/controllers/post/create-post')

jest.mock('../../../src/models/post')
Post.prototype.save = jest.fn()
Post.prototype.populate = jest.fn().mockResolvedValue({})

const id = 'someMongodbObjectId'
const title = 'New Post Title'
const role = 'New Post Role'

describe('createPost', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should respond with 200 & new post object on success', async () => {
    expect.assertions(7)
    req.token._id = id
    req.body.title = title
    req.body.role = role

    // mock Post model results
    Post.findOne = jest.fn(() => Post)
    Post.exec = jest.fn().mockResolvedValue(undefined)

    await createPost(req, res, next)
    expect(Post.findOne).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
    expect(Post.prototype.save).toHaveBeenCalledTimes(1)
    expect(Post.prototype.populate).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining('New post saved'),
      post: expect.any(Object)
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should reject with 400 status if post already exists', async () => {
    expect.assertions(6)
    req.token._id = id
    req.body.title = title
    req.body.role = role

    // mock Post model results
    Post.findOne = jest.fn(() => Post)
    Post.exec = jest.fn().mockResolvedValue({ title, role })

    await createPost(req, res, next)
    expect(Post.findOne).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
    expect(Post.prototype.save).not.toHaveBeenCalled()
    expect(Post.prototype.populate).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('post already exists')
    }))
  })

  it('should handle errors thrown from DB calls', async () => {
    expect.assertions(5)
    req.token._id = id
    req.body.title = title
    req.body.role = role

    // mock Post model method rejection
    Post.findOne = jest.fn(() => Post)
    Post.exec = jest.fn().mockRejectedValue(new Error('Borked'))

    await createPost(req, res, next)
    expect(Post.findOne).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Borked')
    }))
  })
})
