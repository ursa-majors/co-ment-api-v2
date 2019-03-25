'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const Post = require('../../../src/models/post')
const reqResNext = require('../../fixtures/req-res-next')
const incrementViews = require('../../../src/controllers/post/increment-view-count')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

describe('incrementViews', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    res.end = jest.fn()
    next = reqResNext.next
  })

  it('should respond with 200 status on success', async () => {
    expect.assertions(5)
    req.token._id = userId
    req.params.id = postId

    // mock Post model instance & static methods
    Post.incrementViews = jest.fn().mockResolvedValue({})

    await incrementViews(req, res, next)
    expect(Post.incrementViews).toHaveBeenCalledTimes(1)
    expect(Post.incrementViews).toHaveBeenCalledWith({
      target: {
        _id: postId,
        author: { $ne: userId }
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from DB calls', async () => {
    expect.assertions(5)
    req.token._id = userId
    req.params.id = postId

    // mock Post model method rejection
    Post.incrementViews = jest.fn().mockRejectedValue(new Error('Borked'))

    await incrementViews(req, res, next)
    expect(Post.incrementViews).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.end).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Borked')
    }))
  })
})
