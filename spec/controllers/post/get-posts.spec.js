'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const Post = require('../../../src/models/post')
const reqResNext = require('../../fixtures/req-res-next')
const getPosts = require('../../../src/controllers/post/get-posts')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

const posts = [
  {
    _id: postId,
    role: 'mentor',
    author: userId,
    active: true
  },
  {
    _id: 'postId2',
    role: 'mentee',
    author: userId,
    active: true
  },
  {
    _id: 'postId3',
    role: 'mentor',
    author: 'authorId2',
    active: false
  },
  {
    _id: 'postId4',
    role: 'mentee',
    author: 'authorId2',
    active: false
  }
]

describe('getPosts', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should call findPosts w/ default query and respond with 200 & array of posts', async () => {
    expect.assertions(5)

    // mock Post model static method
    Post.findPosts = jest.fn().mockResolvedValue(posts)

    await getPosts(req, res, next)
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      query: {
        active: true,
        deleted: false
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.any(Array))
    expect(next).not.toHaveBeenCalled()
  })

  it('should call findPosts w/ enhanced query and respond with 200 & array of posts', async () => {
    expect.assertions(5)
    req.query.id = postId

    // mock Post model static method
    Post.findPosts = jest.fn().mockResolvedValue(posts)

    await getPosts(req, res, next)
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      query: {
        _id: postId,
        active: true,
        deleted: false
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.any(Array))
    expect(next).not.toHaveBeenCalled()
  })

  it('should call findPosts w/o `active` query param when specified', async () => {
    expect.assertions(5)
    req.query.active = 'all'

    // mock Post model static method
    Post.findPosts = jest.fn().mockResolvedValue(posts)

    await getPosts(req, res, next)
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      query: {
        deleted: false
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.any(Array))
    expect(next).not.toHaveBeenCalled()
  })

  it('should call findPosts w other query params when specified', async () => {
    expect.assertions(5)
    req.query.author = userId

    // mock Post model static method
    Post.findPosts = jest.fn().mockResolvedValue(posts)

    await getPosts(req, res, next)
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      query: {
        active: true,
        deleted: false,
        author: userId
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.any(Array))
    expect(next).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from DB calls', async () => {
    expect.assertions(5)
    req.token._id = userId
    req.params.id = postId

    // mock Post model method rejection
    Post.findPosts = jest.fn().mockRejectedValue(new Error('Borked'))

    await getPosts(req, res, next)
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Borked')
    }))
  })
})
