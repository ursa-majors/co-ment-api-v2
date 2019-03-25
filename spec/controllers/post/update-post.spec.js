'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const Post = require('../../../src/models/post')
const reqResNext = require('../../fixtures/req-res-next')
const updatePost = require('../../../src/controllers/post/update-post')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

const populatedPost = {
  _id: postId,
  author: userId,
  action: '',
  role: '',
  title: '',
  body: '',
  excerpt: '',
  keywords: [],
  availability: '',
  meta: { likes: 0 },
  username: '',
  name: '',
  avatarUrl: '',
  time_zone: '',
  languages: [],
  gender: ''
}

const post = {
  _id: postId,
  author: userId,
  action: '',
  role: '',
  title: '',
  body: '',
  excerpt: '',
  keywords: [],
  availability: '',
  meta: { likes: 0 },
  populate: jest.fn().mockResolvedValue(populatedPost)
}

describe('updatePost', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should respond with 200 status & updated post on success', async () => {
    expect.assertions(6)
    req.token._id = userId
    req.params.id = postId
    req.body = { title: 'Updated Title' }

    // mock model static methods
    Post.updatePost = jest.fn().mockResolvedValue(post)

    await updatePost(req, res, next)
    expect(Post.updatePost).toHaveBeenCalledTimes(1)
    expect(Post.updatePost).toHaveBeenCalledWith({
      target: { _id: postId, author: userId },
      updates: { ...req.body, updatedAt: expect.any(String) },
      options: { new: true }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post updated',
      post: expect.any(Object)
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should respond with 404 if cannot find post to update', async () => {
    expect.assertions(6)
    req.token._id = userId
    req.params.id = postId
    req.body = { title: 'Updated Title' }

    // mock model static methods
    Post.updatePost = jest.fn().mockResolvedValue(null)

    await updatePost(req, res, next)
    expect(Post.updatePost).toHaveBeenCalledTimes(1)
    expect(Post.updatePost).toHaveBeenCalledWith({
      target: { _id: postId, author: userId },
      updates: { ...req.body, updatedAt: expect.any(String) },
      options: { new: true }
    })
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: expect.stringContaining('Post not found')
    }))
  })

  it('should handle errors thrown from Post DB method calls', async () => {
    expect.assertions(5)
    req.token._id = userId
    req.params.id = postId

    // mock Post model method rejection
    Post.updatePost = jest.fn().mockRejectedValue(new Error('Post Borked'))

    await updatePost(req, res, next)
    expect(Post.updatePost).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Post Borked')
    }))
  })
})
