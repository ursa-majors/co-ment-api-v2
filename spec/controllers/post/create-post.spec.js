'use strict'

const Post = require('../../../src/models/post')
const createPost = require('../../../src/controllers/post/create-post')
const { req, res, next } = require('../../fixtures/req-res-next')

jest.mock('../../../src/models/post')
Post.prototype.save = jest.fn()
Post.prototype.populate = jest.fn().mockResolvedValue({})

const id = 'someMongodbObjectId'
const title = 'New Post Title'
const role = 'New Post Role'

describe('createPost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 & new post object on success', async () => {
    req.token._id = id
    req.body.title = title
    req.body.role = role

    // mock model methods
    Post.findOne = jest.fn(function () { return Post })
    Post.exec = jest.fn().mockResolvedValue(undefined)

    await createPost(req, res, next)
    expect(Post.findOne).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
    expect(Post.prototype.save).toHaveBeenCalledTimes(1)
    expect(Post.prototype.populate).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: expect.any(String),
      post: expect.any(Object)
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should reject with 400 status if post already exists', async () => {
    req.token._id = id
    req.body.title = title
    req.body.role = role

    // mock model methods
    Post.findOne = jest.fn(function () { return Post })
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
})
