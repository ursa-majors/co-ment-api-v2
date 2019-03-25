'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const Post = require('../../../src/models/post')
const reqResNext = require('../../fixtures/req-res-next')
const deletePost = require('../../../src/controllers/post/delete-post')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

describe('deletePost', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should respond with 200 & deleted JSON on success', async () => {
    expect.assertions(5)
    req.token._id = userId
    req.params.id = postId

    // mock Post model instance & static methods
    const populate = jest.fn().mockResolvedValue({})
    Post.deletePost = jest.fn().mockResolvedValue({ populate })

    await deletePost(req, res, next)
    expect(Post.deletePost).toHaveBeenCalledTimes(1)
    expect(populate).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining('Post deleted'),
      post: expect.any(Object)
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should reject with 400 status if post already exists', async () => {
    expect.assertions(5)
    req.token._id = userId
    req.params.id = postId

    // mock Post model instance & static methods
    Post.deletePost = jest.fn().mockResolvedValue(undefined)

    await deletePost(req, res, next)
    expect(Post.deletePost).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: expect.stringContaining('Post not found')
    }))
  })

  it('should handle errors thrown from DB calls', async () => {
    expect.assertions(5)
    req.token._id = userId
    req.params.id = postId

    // mock Post model method rejection
    Post.deletePost = jest.fn().mockRejectedValue(new Error('Borked'))

    await deletePost(req, res, next)
    expect(Post.deletePost).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Borked')
    }))
  })
})
